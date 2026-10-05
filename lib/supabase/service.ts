import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
export function serviceDatabase() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return null;
  return createClient(
    String(env.NEXT_PUBLIC_SUPABASE_URL),
    String(env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
