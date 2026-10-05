import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { AdminLogout } from "./admin-logout";
export const adminSections = [
  { resource: "", label: "Dashboard" },
  { resource: "inquiries", label: "Enquiries" },
  { resource: "properties", label: "Properties" },
  { resource: "projects", label: "Projects" },
  { resource: "testimonials", label: "Testimonials" },
  { resource: "faqs", label: "FAQs" },
  { resource: "users", label: "Staff users", adminOnly: true },
] as const;
export const adminTitles: Record<string, string> = {
  inquiries: "Enquiries",
  properties: "Properties",
  projects: "Projects",
  testimonials: "Testimonials",
  faqs: "FAQs",
  users: "Staff users",
};
export function AdminShell({
  email,
  role,
  title,
  active,
  children,
}: {
  email: string;
  role: "admin" | "editor";
  title: string;
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="admin-brand">
          {site.name}
          <span>STAFF DASHBOARD</span>
        </Link>
        <div>
          <span className="role-badge">
            {email} · {role}
          </span>
          <a className="text-link" href="/" target="_blank" rel="noreferrer">
            View website
          </a>
          <AdminLogout />
        </div>
      </header>
      <nav className="admin-nav" aria-label="Admin sections">
        {adminSections
          .filter((section) => !("adminOnly" in section) || role === "admin")
          .map((section) => (
            <Link
              key={section.resource || "dashboard"}
              href={section.resource ? `/admin/${section.resource}` : "/admin"}
              className={section.resource === active ? "button outline" : ""}
              aria-current={section.resource === active ? "page" : undefined}
            >
              {section.label}
            </Link>
          ))}
      </nav>
      <main className="admin-main">
        <p className="eyebrow">MAD STAFF AREA · NOT PUBLIC</p>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}
