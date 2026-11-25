import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Uses the secret service_role key, so it must
 * only ever run on the server (never in the browser).
 */
let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function db(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not connected yet. Add the keys to your .env file (see README).");
  }
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}
