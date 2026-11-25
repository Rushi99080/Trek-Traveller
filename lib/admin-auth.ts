/**
 * Simple password login for the admin panel.
 * Set ADMIN_PASSWORD in your environment variables.
 * Works in middleware (edge) and on the server.
 */
export const ADMIN_COOKIE = "admin_session";

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  // Demo mode only (no database connected): default password "admin"
  const hasDb = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  return hasDb ? null : "admin";
}

export async function adminToken(password: string) {
  const data = new TextEncoder().encode(`trek-admin:v1:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(cookieValue: string | undefined) {
  const pw = adminPassword();
  if (!pw || !cookieValue) return false;
  return cookieValue === (await adminToken(pw));
}
