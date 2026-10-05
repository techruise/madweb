import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminResource } from "@/components/admin-resource";
import { AdminShell, adminTitles } from "@/components/admin-shell";
import { requireStaff } from "@/lib/admin/auth";
import { serviceDatabase } from "@/lib/supabase/service";
export const dynamic = "force-dynamic";
type Row = Record<string, unknown> & { id: string };
const editable = [
  "properties",
  "projects",
  "testimonials",
  "faqs",
  "inquiries",
  "users",
];
export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  return {
    title: `${adminTitles[resource] ?? "Section"} | MAD staff`,
    robots: "noindex, nofollow, nocache",
  };
}
async function catalogRows(
  db: NonNullable<Awaited<ReturnType<typeof requireStaff>>["db"]>,
  resource: string,
): Promise<Row[]> {
  const images =
    resource === "properties"
      ? "property_images"
      : resource === "projects"
        ? "project_images"
        : "";
  const { data, error } = await db
    .from(resource)
    .select(images ? `*, ${images}(*)` : "*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []) as unknown as Row[];
}
async function staffRows(): Promise<Row[]> {
  const db = serviceDatabase();
  if (!db) return [];
  const [{ data: listed }, { data: profiles }] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 100 }),
    db.from("profiles").select("id, role"),
  ]);
  const roles = new Map(
    (profiles ?? []).map((profile: { id: string; role: string }) => [
      profile.id,
      profile.role,
    ]),
  );
  return (listed?.users ?? [])
    .filter((user) => roles.has(user.id))
    .map(
      (user) =>
        ({
          id: user.id,
          email: user.email ?? "",
          role: roles.get(user.id),
          created_at: user.created_at,
        }) as Row,
    );
}
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (!editable.includes(resource)) notFound();
  const session = await requireStaff();
  if (resource === "users" && session.role !== "admin") notFound();
  const rows =
    resource === "users" ? await staffRows() : await catalogRows(session.db, resource);
  return (
    <AdminShell
      email={session.user.email ?? "staff"}
      role={session.role}
      title={adminTitles[resource] ?? "Section"}
      active={resource}
    >
      <AdminResource resource={resource} rows={rows} role={session.role} />
      {resource === "inquiries" && (
        <p className="muted small-copy">
          <a className="text-link" href="/api/admin/inquiries/export" download>
            Download all enquiries as CSV
          </a>{" "}
          — includes internal notes. Keep the file private.
        </p>
      )}
    </AdminShell>
  );
}
