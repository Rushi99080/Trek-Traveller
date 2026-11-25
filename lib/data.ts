import "server-only";
import { cache } from "react";
import { getSampleTrips, sampleLeaders } from "@/data/sample-trips";
import { sampleCoupons } from "@/data/content";
import { db, isSupabaseConfigured } from "./supabase";
import {
  batchToRow,
  bookingToRow,
  isUuid,
  rowToBatch,
  rowToBooking,
  rowToCoupon,
  rowToEnquiry,
  rowToLeader,
  rowToTrip,
  tripToRow,
} from "./db-map";
import type { Batch, Booking, Coupon, Enquiry, Leader, Trip } from "./types";

export { isSupabaseConfigured };

/* ------------------------------------------------------------------
 * DEMO STORE
 * When Supabase isn't connected yet, the site runs on sample data kept
 * in memory. Changes made in Admin last until the server restarts.
 * ------------------------------------------------------------------ */
interface DemoStore {
  trips: Trip[];
  leaders: Leader[];
  coupons: Coupon[];
  bookings: Booking[];
  enquiries: Enquiry[];
}
const g = globalThis as unknown as { __demoStore?: DemoStore };
function demo(): DemoStore {
  if (!g.__demoStore) {
    const trips = getSampleTrips();
    g.__demoStore = {
      trips,
      leaders: sampleLeaders.map((l) => ({ ...l })),
      coupons: sampleCoupons.map((c) => ({ ...c })),
      bookings: makeDemoBookings(trips),
      enquiries: makeDemoEnquiries(),
    };
  }
  return g.__demoStore;
}

const bySort = (a: Trip, b: Trip) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/* ---------------------------- Trips ---------------------------- */

export const getTrips = cache(async (opts: { includeUnpublished?: boolean } = {}): Promise<Trip[]> => {
  if (!isSupabaseConfigured()) {
    return clone(demo().trips.filter((t) => opts.includeUnpublished || t.isPublished).sort(bySort));
  }
  let q = db().from("trips").select("*, batches(*)").order("sort_order").order("name");
  if (!opts.includeUnpublished) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToTrip);
});

export const getTripBySlug = cache(async (slug: string): Promise<Trip | null> => {
  if (!isSupabaseConfigured()) {
    const t = demo().trips.find((x) => x.slug === slug && x.isPublished);
    return t ? clone(t) : null;
  }
  const { data, error } = await db()
    .from("trips")
    .select("*, batches(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data) : null;
});

export async function getTripById(id: string): Promise<Trip | null> {
  if (!isSupabaseConfigured()) {
    const t = demo().trips.find((x) => x.id === id);
    return t ? clone(t) : null;
  }
  if (!isUuid(id)) return null;
  const { data, error } = await db().from("trips").select("*, batches(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data) : null;
}

export async function getBatch(batchId: string): Promise<Batch | null> {
  if (!isSupabaseConfigured()) {
    for (const t of demo().trips) {
      const b = t.batches.find((x) => x.id === batchId);
      if (b) return clone(b);
    }
    return null;
  }
  if (!isUuid(batchId)) return null;
  const { data } = await db().from("batches").select("*").eq("id", batchId).maybeSingle();
  return data ? rowToBatch(data) : null;
}

/** Save a trip and its batches (Admin) */
export async function saveTrip(trip: Trip): Promise<Trip> {
  if (!isSupabaseConfigured()) {
    const store = demo();
    const t = clone(trip);
    if (!t.id) t.id = "trip-" + Math.random().toString(36).slice(2, 8);
    t.batches = t.batches.map((b, i) => ({ ...b, tripId: t.id, id: b.id || `${t.id}-n${Date.now()}${i}` }));
    const i = store.trips.findIndex((x) => x.id === t.id);
    if (i >= 0) store.trips[i] = t;
    else store.trips.push(t);
    return clone(t);
  }
  const client = db();
  const { data, error } = await client.from("trips").upsert(tripToRow(trip)).select().single();
  if (error) throw error;
  const tripId = data.id as string;

  // Sync batches: update existing, insert new, delete removed (only if no bookings)
  const { data: existing } = await client.from("batches").select("id").eq("trip_id", tripId);
  const keepIds = trip.batches.map((b) => b.id).filter(isUuid);
  const toDelete = (existing ?? []).map((r) => r.id as string).filter((id) => !keepIds.includes(id));
  if (toDelete.length) {
    const { data: used } = await client.from("bookings").select("batch_id").in("batch_id", toDelete);
    const usedIds = new Set((used ?? []).map((u) => u.batch_id));
    const safe = toDelete.filter((id) => !usedIds.has(id));
    if (safe.length) await client.from("batches").delete().in("id", safe);
    // Batches that already have bookings are closed instead of deleted
    const closed = toDelete.filter((id) => usedIds.has(id));
    if (closed.length) await client.from("batches").update({ status: "closed" }).in("id", closed);
  }
  const rows = trip.batches.map((b) => batchToRow(b, tripId));
  const withId = rows.filter((r) => r.id);
  const withoutId = rows.filter((r) => !r.id);
  if (withId.length) {
    const { error: e1 } = await client.from("batches").upsert(withId);
    if (e1) throw e1;
  }
  if (withoutId.length) {
    const { error: e2 } = await client.from("batches").insert(withoutId);
    if (e2) throw e2;
  }
  return (await getTripById(tripId))!;
}

export async function deleteTrip(id: string) {
  if (!isSupabaseConfigured()) {
    const store = demo();
    store.trips = store.trips.filter((t) => t.id !== id);
    return;
  }
  const { error } = await db().from("trips").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------- Leaders ---------------------------- */

export const getLeaders = cache(async (): Promise<Leader[]> => {
  if (!isSupabaseConfigured()) return clone(demo().leaders);
  const { data, error } = await db().from("leaders").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(rowToLeader);
});

export async function saveLeader(l: Leader): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = demo();
    if (!l.id) l.id = "leader-" + Math.random().toString(36).slice(2, 7);
    const i = store.leaders.findIndex((x) => x.id === l.id);
    if (i >= 0) store.leaders[i] = l;
    else store.leaders.push(l);
    return;
  }
  const row: Record<string, unknown> = { name: l.name, phone: l.phone, photo: l.photo, bio: l.bio, experience: l.experience };
  if (isUuid(l.id)) row.id = l.id;
  const { error } = await db().from("leaders").upsert(row);
  if (error) throw error;
}

export async function deleteLeader(id: string) {
  if (!isSupabaseConfigured()) {
    demo().leaders = demo().leaders.filter((l) => l.id !== id);
    return;
  }
  const { error } = await db().from("leaders").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------- Coupons ---------------------------- */

export async function getCoupon(code: string): Promise<Coupon | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  if (!isSupabaseConfigured()) return demo().coupons.find((x) => x.code === c) ?? null;
  const { data } = await db().from("coupons").select("*").eq("code", c).maybeSingle();
  return data ? rowToCoupon(data) : null;
}

/* ---------------------------- Bookings ---------------------------- */

export function newBookingCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

export async function createBooking(b: Booking): Promise<Booking> {
  if (!isSupabaseConfigured()) {
    const row = { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    demo().bookings.unshift(row);
    return clone(row);
  }
  const { data, error } = await db().from("bookings").insert(bookingToRow(b)).select().single();
  if (error) throw error;
  return rowToBooking(data);
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    const b = demo().bookings.find((x) => x.id === id);
    return b ? clone(b) : null;
  }
  if (!isUuid(id)) return null;
  const { data } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
  return data ? rowToBooking(data) : null;
}

export async function getBookingByOrderId(orderId: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    const b = demo().bookings.find((x) => x.razorpayOrderId === orderId);
    return b ? clone(b) : null;
  }
  const { data } = await db().from("bookings").select("*").eq("razorpay_order_id", orderId).maybeSingle();
  return data ? rowToBooking(data) : null;
}

export async function updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    const b = demo().bookings.find((x) => x.id === id);
    if (!b) return null;
    Object.assign(b, patch);
    return clone(b);
  }
  const map: Record<string, string> = {
    status: "status",
    paymentStatus: "payment_status",
    amountPaid: "amount_paid",
    razorpayOrderId: "razorpay_order_id",
    razorpayPaymentId: "razorpay_payment_id",
    notes: "notes",
  };
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(patch)) if (map[k]) row[map[k]] = v;
  const { data, error } = await db().from("bookings").update(row).eq("id", id).select().single();
  if (error) throw error;
  return rowToBooking(data);
}

/** Adds the booking's travellers to the batch seat count (only once) */
export async function confirmSeats(bookingId: string) {
  if (!isSupabaseConfigured()) {
    const store = demo();
    const b = store.bookings.find((x) => x.id === bookingId) as (Booking & { seatsCounted?: boolean }) | undefined;
    if (!b || b.seatsCounted) return;
    for (const t of store.trips) {
      const bt = t.batches.find((x) => x.id === b.batchId);
      if (bt) {
        bt.seatsBooked += b.travellersCount;
        if (bt.seatsBooked >= bt.totalSeats && bt.status !== "sold_out") bt.status = "waitlist";
      }
    }
    b.seatsCounted = true;
    return;
  }
  const { error } = await db().rpc("confirm_booking_seats", { p_booking_id: bookingId });
  if (error) throw error;
}

export async function releaseSeats(bookingId: string) {
  if (!isSupabaseConfigured()) {
    const store = demo();
    const b = store.bookings.find((x) => x.id === bookingId) as (Booking & { seatsCounted?: boolean }) | undefined;
    if (!b || !b.seatsCounted) return;
    for (const t of store.trips) {
      const bt = t.batches.find((x) => x.id === b.batchId);
      if (bt) bt.seatsBooked = Math.max(0, bt.seatsBooked - b.travellersCount);
    }
    b.seatsCounted = false;
    return;
  }
  const { error } = await db().rpc("release_booking_seats", { p_booking_id: bookingId });
  if (error) throw error;
}

export interface BookingFilters {
  tripId?: string;
  batchId?: string;
  paymentStatus?: string;
  status?: string;
  q?: string;
}

export async function listBookings(f: BookingFilters = {}): Promise<Booking[]> {
  let list: Booking[];
  if (!isSupabaseConfigured()) {
    list = clone(demo().bookings);
  } else {
    let q = db().from("bookings").select("*").order("created_at", { ascending: false }).limit(1000);
    if (f.tripId && isUuid(f.tripId)) q = q.eq("trip_id", f.tripId);
    if (f.batchId && isUuid(f.batchId)) q = q.eq("batch_id", f.batchId);
    if (f.paymentStatus) q = q.eq("payment_status", f.paymentStatus);
    if (f.status) q = q.eq("status", f.status);
    const { data, error } = await q;
    if (error) throw error;
    list = (data ?? []).map(rowToBooking);
  }
  // Filters (also applied for demo mode)
  if (f.tripId) list = list.filter((b) => b.tripId === f.tripId);
  if (f.batchId) list = list.filter((b) => b.batchId === f.batchId);
  if (f.paymentStatus) list = list.filter((b) => b.paymentStatus === f.paymentStatus);
  if (f.status) list = list.filter((b) => b.status === f.status);
  if (f.q) {
    const s = f.q.toLowerCase();
    list = list.filter(
      (b) =>
        b.bookingCode.toLowerCase().includes(s) ||
        b.contactName.toLowerCase().includes(s) ||
        b.contactPhone.includes(s) ||
        b.contactEmail.toLowerCase().includes(s),
    );
  }
  return list;
}

/* ---------------------------- Enquiries ---------------------------- */

export async function createEnquiry(e: Omit<Enquiry, "id" | "createdAt" | "status" | "notes">): Promise<Enquiry> {
  if (!isSupabaseConfigured()) {
    const row: Enquiry = { ...e, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "new", notes: "" };
    demo().enquiries.unshift(row);
    return row;
  }
  const { data, error } = await db()
    .from("enquiries")
    .insert({
      type: e.type,
      name: e.name,
      phone: e.phone,
      email: e.email,
      group_size: e.groupSize,
      destination: e.destination,
      preferred_dates: e.preferredDates,
      budget: e.budget,
      trip_type: e.tripType,
      message: e.message,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToEnquiry(data);
}

export async function listEnquiries(status?: string): Promise<Enquiry[]> {
  if (!isSupabaseConfigured()) {
    const list = clone(demo().enquiries);
    return status ? list.filter((e) => e.status === status) : list;
  }
  let q = db().from("enquiries").select("*").order("created_at", { ascending: false }).limit(500);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToEnquiry);
}

export async function updateEnquiry(id: string, patch: { status?: string; notes?: string }) {
  if (!isSupabaseConfigured()) {
    const e = demo().enquiries.find((x) => x.id === id);
    if (e) Object.assign(e, patch);
    return;
  }
  const { error } = await db().from("enquiries").update(patch).eq("id", id);
  if (error) throw error;
}

/* ---------------------------- Demo records ---------------------------- */

function makeDemoBookings(trips: Trip[]): Booking[] {
  const names = ["Sample Traveller A", "Sample Traveller B", "Sample Traveller C", "Sample Traveller D", "Sample Traveller E"];
  const out: Booking[] = [];
  const picks: [number, number, number, Booking["paymentStatus"]][] = [
    [0, 0, 2, "paid"],
    [0, 0, 1, "paid"],
    [1, 1, 4, "advance"],
    [4, 0, 3, "advance"],
    [2, 0, 1, "paid"],
  ];
  picks.forEach(([ti, bi, count, ps], i) => {
    const t = trips[ti];
    const b = t.batches[bi];
    const pickup = t.pickupPrices[0];
    const total = pickup.price * count;
    const paid = ps === "advance" ? Math.max(t.advanceAmount, 500) * count : total;
    const created = new Date(Date.now() - (i + 1) * 36e5 * 7).toISOString();
    out.push({
      id: `demo-booking-${i + 1}`,
      bookingCode: `DEMO-${100 + i}`,
      tripId: t.id,
      batchId: b.id,
      tripName: t.name,
      tripSlug: t.slug,
      batchStart: b.startDate,
      batchEnd: b.endDate,
      pickup: pickup.pickup,
      stayOption: t.stayOptions[0]?.name ?? "",
      travellersCount: count,
      travellers: Array.from({ length: count }, (_, k) => ({
        name: k === 0 ? names[i] : `${names[i]} – friend ${k}`,
        age: 24 + k,
        gender: k % 2 ? "Female" : "Male",
        phone: "90000000" + String(10 + i * 4 + k).padStart(2, "0"),
        email: k === 0 ? `traveller${i + 1}@example.com` : "",
        emergencyName: "Family member",
        emergencyPhone: "9111111111",
        idType: "Aadhaar card",
        medicalNotes: "",
      })),
      contactName: names[i],
      contactPhone: "90000000" + String(10 + i * 4).padStart(2, "0"),
      contactEmail: `traveller${i + 1}@example.com`,
      perPerson: pickup.price,
      baseAmount: total,
      groupDiscount: 0,
      couponCode: "",
      couponDiscount: 0,
      totalAmount: total,
      paymentOption: ps === "advance" ? "advance" : "full",
      amountDueNow: paid,
      amountPaid: paid,
      status: "confirmed",
      paymentStatus: ps,
      isDemo: true,
      createdAt: created,
    });
  });
  return out;
}

function makeDemoEnquiries(): Enquiry[] {
  return [
    {
      id: "demo-enq-1",
      type: "custom",
      name: "Sample Company HR",
      phone: "9000000001",
      email: "hr@example.com",
      groupSize: 45,
      destination: "Pawna Lake or Lonavala",
      preferredDates: "Second week of January",
      budget: "₹2,000 – 3,000 per person",
      tripType: "Corporate",
      message: "Team offsite with activities and dinner.",
      status: "new",
      notes: "",
      createdAt: new Date(Date.now() - 5 * 36e5).toISOString(),
    },
    {
      id: "demo-enq-2",
      type: "custom",
      name: "Sample College Group",
      phone: "9000000002",
      email: "",
      groupSize: 18,
      destination: "Harishchandragad",
      preferredDates: "Any weekend in December",
      budget: "Under ₹2,000",
      tripType: "College",
      message: "",
      status: "contacted",
      notes: "Sent options on WhatsApp",
      createdAt: new Date(Date.now() - 50 * 36e5).toISOString(),
    },
  ];
}
