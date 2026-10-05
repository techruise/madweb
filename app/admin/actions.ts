"use server";
import { redirect } from "next/navigation";
import { serverDatabase } from "@/lib/supabase/server";
/** Server Actions for the staff session. Redirects stay outside try/catch. */
export async function login(
  _previous: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const db = await serverDatabase();
  if (!db)
    return {
      error: "Sign-in is not configured on this deployment. Contact the owner.",
    };
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8 || password.length > 128)
    return { error: "Enter your email and password." };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: "Those credentials were not accepted." };
  redirect("/admin");
}
export async function logout() {
  const db = await serverDatabase();
  await db?.auth.signOut();
  redirect("/admin/login");
}
