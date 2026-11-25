"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminPassword, adminToken, isValidSession } from "@/lib/admin-auth";
import {
  confirmSeats,
  deleteLeader,
  deleteTrip,
  getBooking,
  getTripById,
  getTrips,
  isSupabaseConfigured,
  releaseSeats,
  saveLeader,
  saveTrip,
  updateBooking,
  updateEnquiry,
} from "@/lib/data";
import { db } from "@/lib/supabase";
import { slugify } from "@/lib/format";
import type { Booking, Leader, Trip } from "@/lib/types";

async function requireAdmin() {
  const jar = await cookies();
  if (!(await isValidSession(jar.get(ADMIN_COOKIE)?.value))) throw new Error("Not logged in");
}

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/treks");
  if (slug) revalidatePath(`/treks/${slug}`);
  revalidatePath("/admin", "layout");
}

/* ---------- Login ---------- */

export async function loginAction(_: unknown, formData: FormData) {
  const pw = adminPassword();
  if (!pw) return { error: "Admin login is switched off. Set ADMIN_PASSWORD in your environment variables." };
  if (String(formData.get("password") || "") !== pw) return { error: "Wrong password." };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await adminToken(pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ---------- Trips ---------- */

export async function saveTripAction(trip: Trip): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  try {
    if (!trip.name.trim()) return { ok: false, error: "Add a trip name." };
    trip.slug = slugify(trip.slug || trip.name);
    if (!trip.pickupPrices.length) return { ok: false, error: "Add at least one pickup point with a price." };
    const others = (await getTrips({ includeUnpublished: true })).filter((t) => t.id !== trip.id);
    if (others.some((t) => t.slug === trip.slug)) return { ok: false, error: `Another trip already uses the web address /treks/${trip.slug}. Change the URL slug.` };
    const saved = await saveTrip(trip);
    refreshPublicPages(saved.slug);
    return { ok: true, id: saved.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't save" };
  }
}

export async function duplicateTripAction(id: string) {
  await requireAdmin();
  const t = await getTripById(id);
  if (!t) return;
  const copy: Trip = { ...t, id: "", name: `${t.name} (copy)`, slug: `${t.slug}-copy-${Math.random().toString(36).slice(2, 5)}`, isPublished: false, batches: [] };
  const saved = await saveTrip(copy);
  refreshPublicPages();
  redirect(`/admin/trips/${saved.id}`);
}

export async function deleteTripAction(id: string) {
  await requireAdmin();
  await deleteTrip(id);
  refreshPublicPages();
  redirect("/admin/trips");
}

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  if (!isSupabaseConfigured()) return { error: "Connect Supabase to upload photos. For now, paste an image link instead." };
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { error: "Choose a photo first." };
  if (file.size > 5 * 1024 * 1024) return { error: "Photo is bigger than 5 MB. Please use a smaller one." };
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `trips/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await db().storage.from("trip-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  const { data } = db().storage.from("trip-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

/* ---------- Bookings ---------- */

export async function updateBookingAction(id: string, patch: Partial<Pick<Booking, "status" | "paymentStatus" | "amountPaid" | "notes">>) {
  await requireAdmin();
  const before = await getBooking(id);
  if (!before) return { ok: false };
  // Mark as fully paid → amount paid becomes the total
  if (patch.paymentStatus === "paid" && patch.amountPaid === undefined) patch.amountPaid = before.totalAmount;
  if ((patch.paymentStatus === "paid" || patch.paymentStatus === "advance") && before.status === "pending") patch.status = "confirmed";
  const after = await updateBooking(id, patch);
  if (after) {
    const counted = (s: string) => s === "confirmed";
    if (counted(after.status) && !counted(before.status)) await confirmSeats(id);
    if (!counted(after.status) && counted(before.status)) await releaseSeats(id);
    if (after.paymentStatus === "refunded" && before.paymentStatus !== "refunded") {
      await releaseSeats(id);
      if (after.status !== "cancelled") await updateBooking(id, { status: "cancelled" });
    }
    refreshPublicPages(after.tripSlug);
  }
  return { ok: true };
}

/* ---------- Enquiries ---------- */

export async function updateEnquiryAction(id: string, patch: { status?: string; notes?: string }) {
  await requireAdmin();
  await updateEnquiry(id, patch);
  revalidatePath("/admin/enquiries");
  return { ok: true };
}

/* ---------- Leaders ---------- */

export async function saveLeaderAction(l: Leader) {
  await requireAdmin();
  if (!l.name.trim()) return { ok: false, error: "Add a name." };
  await saveLeader(l);
  revalidatePath("/admin/leaders");
  revalidatePath("/about");
  return { ok: true };
}

export async function deleteLeaderAction(id: string) {
  await requireAdmin();
  await deleteLeader(id);
  revalidatePath("/admin/leaders");
  return { ok: true };
}
