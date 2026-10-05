import "server-only";
import { redirect } from "next/navigation";
import { serverDatabase } from "@/lib/supabase/server";
export async function staffSession() {
  const db = await serverDatabase();
  if (!db) return null;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "editor"].includes(profile.role)) return null;
  return { db, user, role: profile.role as "admin" | "editor" };
}
export async function requireStaff() {
  const session = await staffSession();
  if (!session) redirect("/admin/login");
  return session;
}
