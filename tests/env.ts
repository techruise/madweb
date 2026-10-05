import assert from "node:assert/strict";
import { validateEnv } from "../lib/env";
const original = { ...process.env };
for (const key of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RATE_LIMIT_SECRET",
  "RESEND_API_KEY",
  "NOTIFICATION_FROM",
  "NOTIFICATION_TO",
])
  delete process.env[key];
process.env.REQUIRE_BACKEND = "false";
assert.doesNotThrow(() => validateEnv());
process.env.RATE_LIMIT_SECRET = "not-long-enough";
assert.throws(() => validateEnv(), /Invalid environment/);
process.env.RATE_LIMIT_SECRET = "a".repeat(32);
assert.throws(() => validateEnv(), /NEXT_PUBLIC_SUPABASE_URL/);
delete process.env.RATE_LIMIT_SECRET;
process.env.REQUIRE_BACKEND = "true";
assert.throws(() => validateEnv(), /Required for the configured backend/);
process.env = original;
console.log(
  "PASS: explicit empty preview accepted; partial, weak-secret and required-backend configurations fail closed",
);
