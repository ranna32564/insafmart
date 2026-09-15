import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, created with the **service-role** key.
 *
 *   SUPABASE_URL=https://xxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Settings -> API -> service_role
 *
 * The service role bypasses RLS, which is why `supabase/schema.sql` enables RLS
 * with no policies: nothing can reach the database except the route handlers in
 * `app/api/**`. Never import this module from a client component — the key must
 * never reach the browser.
 *
 * Creation is lazy so that `next build` (and the type-checker) can run without
 * any credentials present; the throw only happens on the first request that
 * actually touches the database.
 */

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "in your environment (see supabase/schema.sql for where to find them).",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "insaf-mart-next" } },
  });
  return client;
}

/** True when both Supabase env vars are present. */
export function supabaseConfigured(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
