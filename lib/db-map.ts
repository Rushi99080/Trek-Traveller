// Converts between database rows (snake_case) and app objects (camelCase)
import type { Batch, Booking, Coupon, Enquiry, Leader, Trip } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function rowToBatch(r: Row): Batch {
  return {
    id: r.id,
    tripId: r.trip_id,
    startDate: String(r.start_date).slice(0, 10),
    endDate: String(r.end_date ?? r.start_date).slice(0, 10),
    totalSeats: r.total_seats ?? 0,
    seatsBooked: r.seats_booked ?? 0,
    status: r.status ?? "open",
    leaderIds: r.leader_ids ?? [],
    whatsappGroupLink: r.whatsapp_group_link ?? "",
  };
}

export function batchToRow(b: Batch, tripId: string): Row {
  const row: Row = {
    trip_id: tripId,
    start_date: b.startDate,
    end_date: b.endDate || b.startDate,
    total_seats: Number(b.totalSeats) || 0,
    seats_booked: Number(b.seatsBooked) || 0,
    status: b.status,
    leader_ids: b.leaderIds ?? [],
    whatsapp_group_link: b.whatsappGroupLink ?? "",
  };
  if (b.id && isUuid(b.id)) row.id = b.id;
  return row;
}

export function rowToTrip(r: Row): Trip {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    location: r.location ?? "",
    region: r.region ?? "",
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    categories: r.categories ?? [],
    durationDays: r.duration_days ?? 1,
    durationLabel: r.duration_label ?? "",
    difficulty: r.difficulty ?? "Easy",
    altitude: r.altitude ?? "",
    distance: r.distance ?? "",
    bestSeason: r.best_season ?? "",
    shortDescription: r.short_description ?? "",
    overview: r.overview ?? "",
    highlights: r.highlights ?? [],
    itinerary: r.itinerary ?? [],
    inclusions: r.inclusions ?? [],
    exclusions: r.exclusions ?? [],
    thingsToCarry: r.things_to_carry ?? [],
    fitness: r.fitness ?? "",
    meetingPoints: r.meeting_points ?? [],
    pickupPrices: r.pickup_prices ?? [],
    stayOptions: r.stay_options ?? [],
    paymentMode: r.payment_mode ?? "full",
    advanceAmount: r.advance_amount ?? 0,
    groupDiscount: r.group_discount ?? null,
    images: r.images ?? [],
    leaderIds: r.leader_ids ?? [],
    faqs: r.faqs ?? [],
    popularity: r.popularity ?? 50,
    isPublished: r.is_published ?? true,
    sortOrder: r.sort_order ?? 100,
    batches: (r.batches ?? []).map(rowToBatch).sort((a: Batch, b: Batch) => a.startDate.localeCompare(b.startDate)),
  };
}

export function tripToRow(t: Trip): Row {
  const row: Row = {
    slug: t.slug,
    name: t.name,
    location: t.location,
    region: t.region,
    latitude: t.latitude ?? null,
    longitude: t.longitude ?? null,
    categories: t.categories,
    duration_days: Number(t.durationDays) || 1,
    duration_label: t.durationLabel,
    difficulty: t.difficulty,
    altitude: t.altitude,
    distance: t.distance,
    best_season: t.bestSeason,
    short_description: t.shortDescription,
    overview: t.overview,
    highlights: t.highlights,
    itinerary: t.itinerary,
    inclusions: t.inclusions,
    exclusions: t.exclusions,
    things_to_carry: t.thingsToCarry,
    fitness: t.fitness,
    meeting_points: t.meetingPoints,
    pickup_prices: t.pickupPrices,
    stay_options: t.stayOptions,
    payment_mode: t.paymentMode,
    advance_amount: Number(t.advanceAmount) || 0,
    group_discount: t.groupDiscount,
    images: t.images,
    leader_ids: (t.leaderIds ?? []).filter(isUuid),
    faqs: t.faqs,
    popularity: Number(t.popularity) || 0,
    is_published: t.isPublished,
    sort_order: Number(t.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
  if (t.id && isUuid(t.id)) row.id = t.id;
  return row;
}

export function rowToLeader(r: Row): Leader {
  return { id: r.id, name: r.name, phone: r.phone ?? "", photo: r.photo ?? "", bio: r.bio ?? "", experience: r.experience ?? "" };
}

export function rowToCoupon(r: Row): Coupon {
  return {
    code: r.code,
    description: r.description ?? "",
    discountType: r.discount_type,
    value: r.value,
    minPeople: r.min_people ?? 1,
    maxUses: r.max_uses ?? null,
    usedCount: r.used_count ?? 0,
    validUntil: r.valid_until ?? null,
    tripSlugs: r.trip_slugs ?? [],
    active: r.active ?? true,
  };
}

export function rowToBooking(r: Row): Booking {
  return {
    id: r.id,
    bookingCode: r.booking_code,
    tripId: r.trip_id,
    batchId: r.batch_id,
    tripName: r.trip_name,
    tripSlug: r.trip_slug,
    batchStart: String(r.batch_start).slice(0, 10),
    batchEnd: String(r.batch_end).slice(0, 10),
    pickup: r.pickup,
    stayOption: r.stay_option ?? "",
    travellersCount: r.travellers_count,
    travellers: r.travellers ?? [],
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email ?? "",
    perPerson: r.per_person,
    baseAmount: r.base_amount,
    groupDiscount: r.group_discount,
    couponCode: r.coupon_code ?? "",
    couponDiscount: r.coupon_discount,
    totalAmount: r.total_amount,
    paymentOption: r.payment_option,
    amountDueNow: r.amount_due_now,
    amountPaid: r.amount_paid,
    status: r.status,
    paymentStatus: r.payment_status,
    razorpayOrderId: r.razorpay_order_id ?? undefined,
    razorpayPaymentId: r.razorpay_payment_id ?? undefined,
    isDemo: r.is_demo ?? false,
    notes: r.notes ?? "",
    createdAt: r.created_at,
  };
}

export function bookingToRow(b: Booking): Row {
  return {
    booking_code: b.bookingCode,
    trip_id: isUuid(b.tripId) ? b.tripId : null,
    batch_id: isUuid(b.batchId) ? b.batchId : null,
    trip_name: b.tripName,
    trip_slug: b.tripSlug,
    batch_start: b.batchStart,
    batch_end: b.batchEnd,
    pickup: b.pickup,
    stay_option: b.stayOption,
    travellers_count: b.travellersCount,
    travellers: b.travellers,
    contact_name: b.contactName,
    contact_phone: b.contactPhone,
    contact_email: b.contactEmail,
    per_person: b.perPerson,
    base_amount: b.baseAmount,
    group_discount: b.groupDiscount,
    coupon_code: b.couponCode,
    coupon_discount: b.couponDiscount,
    total_amount: b.totalAmount,
    payment_option: b.paymentOption,
    amount_due_now: b.amountDueNow,
    amount_paid: b.amountPaid,
    status: b.status,
    payment_status: b.paymentStatus,
    razorpay_order_id: b.razorpayOrderId ?? null,
    razorpay_payment_id: b.razorpayPaymentId ?? null,
    is_demo: b.isDemo,
    notes: b.notes ?? "",
  };
}

export function rowToEnquiry(r: Row): Enquiry {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    phone: r.phone,
    email: r.email ?? "",
    groupSize: r.group_size ?? null,
    destination: r.destination ?? "",
    preferredDates: r.preferred_dates ?? "",
    budget: r.budget ?? "",
    tripType: r.trip_type ?? "",
    message: r.message ?? "",
    status: r.status,
    notes: r.notes ?? "",
    createdAt: r.created_at,
  };
}

export function isUuid(s: string | undefined | null): s is string {
  return !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
