"use client";
import { logout } from "@/app/admin/actions";
export function AdminLogout() {
  return (
    <form action={logout}>
      <button className="button outline" type="submit">
        Sign out
      </button>
    </form>
  );
}
