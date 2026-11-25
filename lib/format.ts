import type { Batch, DisplayStatus, Trip } from "./types";

export function inr(amount: number) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Parse a YYYY-MM-DD string as a local date (no timezone shift) */
export function parseDate(d: string) {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "Sat, 28 Nov" */
export function shortDate(d: string) {
  const dt = parseDate(d);
  return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
}

/** "28 Nov 2026" */
export function longDate(d: string) {
  const dt = parseDate(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** "28–29 Nov" or "30 Nov – 2 Dec" or "Sat, 28 Nov" */
export function dateRange(start: string, end: string) {
  if (!end || start === end) return shortDate(start);
  const s = parseDate(start);
  const e = parseDate(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS[s.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
}

/** "2026-11" */
export function monthKey(d: string) {
  return d.slice(0, 7);
}

/** "November 2026" */
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const full = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${full[m - 1]} ${y}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function seatsLeft(b: Batch) {
  return Math.max(0, b.totalSeats - b.seatsBooked);
}

export function batchDisplayStatus(b: Batch): DisplayStatus {
  if (b.status === "sold_out") return "Sold Out";
  if (b.status === "waitlist" || seatsLeft(b) <= 0) return "Waitlist";
  if (b.status === "filling_fast") return "Filling Fast";
  const left = seatsLeft(b);
  if (left <= Math.max(5, Math.ceil(b.totalSeats * 0.25))) return "Filling Fast";
  return "Open";
}

/** Upcoming, visible batches sorted by date */
export function upcomingBatches(trip: Trip) {
  const today = todayISO();
  return trip.batches
    .filter((b) => b.status !== "closed" && b.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** The next batch with seats; if every date is full, the next one with a waitlist */
export function nextBatch(trip: Trip) {
  const list = upcomingBatches(trip);
  const status = (b: Batch) => batchDisplayStatus(b);
  return (
    list.find((b) => status(b) === "Open" || status(b) === "Filling Fast") ??
    list.find((b) => status(b) === "Waitlist") ??
    list[0] ??
    null
  );
}

export function fromPrice(trip: Trip) {
  if (!trip.pickupPrices.length) return 0;
  return Math.min(...trip.pickupPrices.map((p) => p.price));
}

export function priceFor(trip: Trip, pickup: string) {
  return trip.pickupPrices.find((p) => p.pickup === pickup)?.price ?? fromPrice(trip);
}

export function statusClasses(s: DisplayStatus) {
  switch (s) {
    case "Open":
      return "bg-forest-50 text-forest-700 ring-forest-200";
    case "Filling Fast":
      return "bg-sunset-50 text-sunset-700 ring-sunset-200";
    case "Waitlist":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "Sold Out":
      return "bg-mountain-100 text-mountain-600 ring-mountain-200";
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
