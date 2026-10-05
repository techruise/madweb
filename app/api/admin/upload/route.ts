import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { staffSession } from "@/lib/admin/auth";
import { sameOrigin } from "@/lib/request-security";
export const dynamic = "force-dynamic";
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES_PER_ITEM = 30;
const MAX_DIMENSION = 2400;
const MAX_PIXELS = 40_000_000;
const metaSchema = z.object({
  kind: z.enum(["properties", "projects"]),
  parent: z.string().uuid(),
  alt: z.string().trim().min(3).max(200),
  stage: z.enum(["before", "after"]).default("after"),
});
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
/** Reject files whose bytes disagree with their declared type (SVG/HTML smuggling). */
function signatureMatches(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  if (type === "image/webp")
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  return false;
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await staffSession();
  if (!session)
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES)
    return NextResponse.json(
      { error: "Use images smaller than 4 MB." },
      { status: 413 },
    );
  const meta = metaSchema.safeParse({
    kind: String(form.get("kind") ?? ""),
    parent: String(form.get("parent") ?? ""),
    alt: String(form.get("alt") ?? ""),
    stage: String(form.get("stage") ?? "after"),
  });
  if (!meta.success)
    return NextResponse.json({ error: "Invalid upload details." }, { status: 400 });
  const { kind, parent, alt, stage } = meta.data;
  if (!allowedTypes.includes(file.type))
    return NextResponse.json(
      { error: "Use a JPEG, PNG or WebP image." },
      { status: 415 },
    );
  const table = kind === "properties" ? "property_images" : "project_images";
  const parentColumn = kind === "properties" ? "property_id" : "project_id";
  const db = session.db;
  const { count } = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(parentColumn, parent);
  if ((count ?? 0) >= MAX_IMAGES_PER_ITEM)
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES_PER_ITEM} images per item.` },
      { status: 400 },
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!signatureMatches(bytes, file.type))
    return NextResponse.json(
      { error: "That file is not a real image." },
      { status: 415 },
    );
  let webp: Buffer;
  try {
    // Re-encode: applies orientation, caps dimensions, strips metadata.
    webp = await sharp(Buffer.from(bytes), { limitInputPixels: MAX_PIXELS })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Could not process that image." }, { status: 415 });
  }
  const storagePath = `${parent}/${randomUUID()}.webp`;
  const { error: uploadError } = await db.storage
    .from(kind)
    .upload(storagePath, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError)
    return NextResponse.json(
      { error: "Could not store that image." },
      { status: 500 },
    );
  const { data: image, error: insertError } = await db
    .from(table)
    .insert({
      [parentColumn]: parent,
      storage_path: storagePath,
      alt,
      sort_order: count ?? 0,
      ...(kind === "projects" ? { stage } : {}),
    })
    .select("id, storage_path, alt, sort_order")
    .single();
  if (insertError || !image) {
    await db.storage.from(kind).remove([storagePath]);
    return NextResponse.json(
      { error: "Could not save that image." },
      { status: 500 },
    );
  }
  return NextResponse.json(
    {
      image: {
        ...image,
        ...(kind === "projects" ? { stage } : {}),
      },
    },
    { status: 201 },
  );
}
