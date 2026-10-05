import { NextResponse } from "next/server";
import { staffSession } from "@/lib/admin/auth";
export const dynamic = "force-dynamic";
const columns = [
  "created_at",
  "status",
  "name",
  "phone",
  "email",
  "service",
  "area",
  "message",
  "source_page",
  "notes",
] as const;
/** Neutralise spreadsheet formula prefixes so an export cannot execute code. */
function safe(value: unknown) {
  const text = String(value ?? "");
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replaceAll('"', '""')}"`;
}
export async function GET() {
  const session = await staffSession();
  if (!session)
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { data, error } = await session.db
    .from("inquiries")
    .select(columns.join(","))
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error)
    return NextResponse.json(
      { error: "Could not read the enquiries." },
      { status: 503 },
    );
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => safe(row[column])).join(",")),
  ].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mad-enquiries-${stamp}.csv"`,
    },
  });
}
