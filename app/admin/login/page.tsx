import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";
import { Monogram } from "@/components/brand";
export const metadata: Metadata = {
  title: "Staff sign in | MAD",
  robots: "noindex, nofollow, nocache",
};
export default function LoginPage() {
  return (
    <main className="admin-login">
      <Monogram />
      <h1>Staff sign in</h1>
      <p className="muted">
        This area is for MAD staff only. Public signup is disabled.
      </p>
      <AdminLogin />
    </main>
  );
}
