import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resources, schemaFor, type Resource } from "@/lib/admin/schemas";
import { staffSession } from "@/lib/admin/auth";
import { boundedJson, sameOrigin } from "@/lib/request-security";
export const dynamic = "force-dynamic";
type Session = NonNullable<Awaited<ReturnType<typeof staffSession>>>;
type Database = Session["db"];
const bodySchema = z.object({
  id: z.string().uuid().optional(),
  data: z.unknown(),
});
const creatable: Resource[] = ["properties", "projects", "testimonials", "faqs"];
const updatable: Resource[] = [
  ...creatable,
  "inquiries",
  "property_images",
  "project_images",
];
const invalid = (error: z.ZodError) =>
  NextResponse.json(
    { error: error.issues.map((issue) => issue.message).join(" ") },
    { status: 400 },
  );
/** Staff writes use the visitor's own session so RLS stays authoritative. */
async function guard(request: NextRequest, resource: string) {
  if (!sameOrigin(request))
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!(resources as readonly string[]).includes(resource))
    return {
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  const session = await staffSession();
  if (!session)
    return {
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  return { session };
}
async function payload(request: NextRequest, resource: Resource) {
  const body = bodySchema.parse(await boundedJson(request));
  // schemaFor already allowlists the exact columns for this resource.
  const data = schemaFor(resource).parse(body.data) as Record<string, unknown>;
  return { id: body.id, data };
}
async function removeObjects(
  db: Database,
  bucket: "properties" | "projects",
  paths: string[],
) {
  if (paths.length) await db.storage.from(bucket).remove(paths);
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const resource = (await context.params).resource as Resource;
  const guarded = await guard(request, resource);
  if ("response" in guarded) return guarded.response;
  if (!creatable.includes(resource))
    return NextResponse.json(
      { error: "Create this item from its own screen." },
      { status: 400 },
    );
  let parsed;
  try {
    parsed = await payload(request, resource);
  } catch (error) {
    return error instanceof z.ZodError
      ? invalid(error)
      : NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { data, error } = await guarded.session.db
    .from(resource)
    .insert(parsed.data)
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json(
      { error: "Could not save this item." },
      { status: 400 },
    );
  return NextResponse.json({ id: data.id }, { status: 201 });
}
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const resource = (await context.params).resource as Resource;
  const guarded = await guard(request, resource);
  if ("response" in guarded) return guarded.response;
  if (!updatable.includes(resource))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  let parsed;
  try {
    parsed = await payload(request, resource);
  } catch (error) {
    return error instanceof z.ZodError
      ? invalid(error)
      : NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await guarded.session.db
    .from(resource)
    .update(parsed.data)
    .eq("id", parsed.id);
  if (error)
    return NextResponse.json(
      { error: "Could not save this item." },
      { status: 400 },
    );
  return NextResponse.json({ id: parsed.id });
}
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const resource = (await context.params).resource as Resource;
  const guarded = await guard(request, resource);
  if ("response" in guarded) return guarded.response;
  if (resource === "inquiries" && guarded.session.role !== "admin")
    return NextResponse.json(
      { error: "Only an administrator can delete an enquiry." },
      { status: 403 },
    );
  if (!updatable.includes(resource))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  let id: string | undefined;
  try {
    id = bodySchema.parse(await boundedJson(request)).id;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = guarded.session.db;
  // Remove stored objects before the cascade deletes their metadata rows.
  if (resource === "properties" || resource === "projects") {
    const { data: images } = await db
      .from(resource === "properties" ? "property_images" : "project_images")
      .select("storage_path")
      .eq(resource === "properties" ? "property_id" : "project_id", id);
    await removeObjects(
      db,
      resource,
      (images ?? []).map((image: { storage_path: string }) => image.storage_path),
    );
  }
  if (resource === "property_images" || resource === "project_images") {
    const { data: image } = await db
      .from(resource)
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    await removeObjects(
      db,
      resource === "property_images" ? "properties" : "projects",
      image ? [image.storage_path] : [],
    );
  }
  const { error } = await db.from(resource).delete().eq("id", id);
  if (error)
    return NextResponse.json(
      { error: "Could not delete this item." },
      { status: 400 },
    );
  return NextResponse.json({ id });
}
