"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
export function AdminLogin() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="admin-login-form">
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          maxLength={128}
          required
        />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="muted small-copy">
        Staff access only. Contact the owner if you need account access.
      </p>
    </form>
  );
}
