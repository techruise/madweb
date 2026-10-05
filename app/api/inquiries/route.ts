import { createHmac } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { inquirySchema } from "@/lib/inquiry-schema";
import { boundedJson, sameOrigin } from "@/lib/request-security";
import { serviceDatabase } from "@/lib/supabase/service";
export const dynamic = "force-dynamic";
/**
 * Public enquiry endpoint. Anonymous users hold no INSERT permission on
 * inquiries, so every check below is the only gate. Order matters: origin,
 * schema, honeypot, backend, then the distributed rate limit.
 */
function clientKey(request: NextRequest) {
  if (process.env.VERCEL === "1") {
    const forwarded = request.headers.get("x-vercel-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() || "shared-bucket";
  }
  // Other hosts have no trusted proxy yet, so they share one safe bucket.
  return "shared-bucket";
}
function keyHash(request: NextRequest) {
  return createHmac("sha256", env.RATE_LIMIT_SECRET ?? "unconfigured-preview")
    .update(clientKey(request))
    .digest("hex");
}
async function notifyStaff() {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_FROM || !env.NOTIFICATION_TO)
    return;
  const adminUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/inquiries`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    // The notification carries a link only, never customer personal data.
    body: JSON.stringify({
      from: env.NOTIFICATION_FROM,
      to: [env.NOTIFICATION_TO],
      subject: "New MAD website enquiry",
      text: `A new enquiry is waiting in the dashboard: ${adminUrl}`,
    }),
  });
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please check your details." },
      { status: 400 },
    );
  const inquiry = parsed.data;
  // Honeypot: accept silently so bots believe they succeeded.
  if (inquiry.website)
    return NextResponse.json({ ok: true }, { status: 202 });
  const db = serviceDatabase();
  if (!db)
    return NextResponse.json(
      { error: "The enquiry service is not configured." },
      { status: 503 },
    );
  const { data: allowed, error: limitError } = await db.rpc(
    "consume_inquiry_limit",
    { p_key: keyHash(request) },
  );
  // Fail closed: without a confirmed counter the enquiry is refused.
  if (limitError || allowed !== true)
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 },
    );
  const { data: saved, error: saveError } = await db
    .from("inquiries")
    .insert({
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      service: inquiry.service,
      area: inquiry.area,
      message: inquiry.message,
      source_page: inquiry.source_page,
    })
    .select("id")
    .single();
  if (saveError || !saved)
    return NextResponse.json(
      { error: "We couldn't save your enquiry." },
      { status: 503 },
    );
  // Delivery failure must never lose an enquiry that is already saved.
  await notifyStaff().catch(() => undefined);
  return NextResponse.json({ ok: true }, { status: 201 });
}
