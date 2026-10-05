import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { staffSession } from "@/lib/admin/auth";
import { boundedJson, sameOrigin } from "@/lib/request-security";
import { serviceDatabase } from "@/lib/supabase/service";
export const dynamic = "force-dynamic";
const bodySchema = z.object({
  id: z.string().uuid().optional(),
  data: z.unknown(),
});
const createSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(128),
    role: z.enum(["admin", "editor"]),
  })
  .strict();
const roleSchema = z.object({ role: z.enum(["admin", "editor"]) }).strict();
/** Only administrators manage staff. Roles live in profiles, never in the JWT. */
async function guardAdmin(request: NextRequest) {
  if (!sameOrigin(request))
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const session = await staffSession();
  if (!session)
    return {
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  if (session.role !== "admin")
    return {
      response: NextResponse.json(
        { error: "Administrators only" },
        { status: 403 },
      ),
    };
  const db = serviceDatabase();
  if (!db)
    return {
      response: NextResponse.json(
        { error: "User management is not configured." },
        { status: 503 },
      ),
    };
  return { db, user: session.user };
}
export async function POST(request: NextRequest) {
  const guarded = await guardAdmin(request);
  if ("response" in guarded) return guarded.response;
  let parsed;
  try {
    parsed = createSchema.parse(bodySchema.parse(await boundedJson(request)).data);
  } catch {
    return NextResponse.json({ error: "Check the email, password and role." }, { status: 400 });
  }
  const { data: created, error: createError } = await guarded.db.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
  });
  if (createError || !created.user)
    return NextResponse.json(
      { error: createError?.message ?? "Could not create that user." },
      { status: 400 },
    );
  const { error: profileError } = await guarded.db
    .from("profiles")
    .upsert({ id: created.user.id, role: parsed.role });
  if (profileError) {
    await guarded.db.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: "Could not grant a role to that user." },
      { status: 400 },
    );
  }
  return NextResponse.json({ id: created.user.id }, { status: 201 });
}
export async function PATCH(request: NextRequest) {
  const guarded = await guardAdmin(request);
  if ("response" in guarded) return guarded.response;
  let id: string | undefined;
  let role: "admin" | "editor";
  try {
    const body = bodySchema.parse(await boundedJson(request));
    id = body.id;
    role = roleSchema.parse(body.data).role;
  } catch {
    return NextResponse.json({ error: "Check the role." }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await guarded.db
    .from("profiles")
    .update({ role })
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: "Could not change that role." }, { status: 400 });
  return NextResponse.json({ id });
}
export async function DELETE(request: NextRequest) {
  const guarded = await guardAdmin(request);
  if ("response" in guarded) return guarded.response;
  let id: string | undefined;
  try {
    id = bodySchema.parse(await boundedJson(request)).id;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (id === guarded.user.id)
    return NextResponse.json(
      { error: "You cannot remove your own access." },
      { status: 400 },
    );
  const { error: profileError } = await guarded.db.from("profiles").delete().eq("id", id);
  if (profileError)
    return NextResponse.json({ error: "Could not remove that user." }, { status: 400 });
  const { error: authError } = await guarded.db.auth.admin.deleteUser(id);
  if (authError)
    return NextResponse.json(
      { error: "Role removed, but the sign-in still exists." },
      { status: 400 },
    );
  return NextResponse.json({ id });
}
