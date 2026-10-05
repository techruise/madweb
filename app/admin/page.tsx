import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell, adminSections } from "@/components/admin-shell";
import { requireStaff } from "@/lib/admin/auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard | MAD staff",
  robots: "noindex, nofollow, nocache",
};
export default async function Dashboard() {
  const { db, user, role } = await requireStaff();
  const tables = ["properties", "projects", "inquiries", "testimonials", "faqs"];
  const counts = await Promise.all(
    tables.map((table) =>
      db.from(table).select("*", { count: "exact", head: true }),
    ),
  );
  const { count: openEnquiries } = await db
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .neq("status", "closed");
  const totals = Object.fromEntries(
    tables.map((table, index) => [table, counts[index].count ?? 0]),
  );
  const cards = [
    { resource: "inquiries", label: "Enquiries received", value: totals.inquiries },
    { resource: "properties", label: "Properties", value: totals.properties },
    { resource: "projects", label: "Projects", value: totals.projects },
    { resource: "testimonials", label: "Testimonials", value: totals.testimonials },
    { resource: "faqs", label: "FAQs", value: totals.faqs },
    { resource: "", label: "Open enquiries", value: openEnquiries ?? 0 },
  ];
  return (
    <AdminShell
      email={user.email ?? "staff"}
      role={role}
      title="Dashboard"
      active=""
    >
      <div className="admin-stats">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.resource ? `/admin/${card.resource}` : "/admin/inquiries"}
          >
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </Link>
        ))}
      </div>
      <section className="admin-help">
        <h2>Before you publish</h2>
        <ul>
          <li>
            Publish only content the owner has verified: real photographs, real
            measurements and real terms.
          </li>
          <li>
            Keep SAMPLE items marked as samples until genuine content replaces
            them, and unpublish them before launch.
          </li>
          <li>
            Upload property and project photos before publishing a listing so
            visitors never see an empty card.
          </li>
          <li>
            Reply to enquiries promptly from the Enquiries page; you can export
            them there as a CSV.
          </li>
          <li>
            Image storage is public. Never upload identity documents, agreements
            or anything confidential.
          </li>
        </ul>
        <p className="muted small-copy">
          Sections: {adminSections.map((section) => section.label).join(" · ")}.
        </p>
      </section>
    </AdminShell>
  );
}
