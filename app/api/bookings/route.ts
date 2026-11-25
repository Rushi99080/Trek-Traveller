import { NextResponse } from "next/server";
import { createBooking, getCoupon, getTripBySlug, newBookingCode, updateBooking } from "@/lib/data";
import { batchDisplayStatus, seatsLeft } from "@/lib/format";
import { calculatePrice, couponError } from "@/lib/pricing";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { notifyBookingConfirmed } from "@/lib/notify";
import { site } from "@/site.config";
import type { Booking, Traveller } from "@/lib/types";

const clean = (s: unknown, max = 200) => String(s ?? "").trim().slice(0, max);

/** Step 1 of payment: create the booking and a Razorpay order */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const trip = await getTripBySlug(clean(body.tripSlug));
  if (!trip) return NextResponse.json({ error: "This trip is no longer available." }, { status: 404 });
  const batch = trip.batches.find((b) => b.id === body.batchId);
  if (!batch || batch.status === "closed") return NextResponse.json({ error: "Please choose a date." }, { status: 400 });

  const status = batchDisplayStatus(batch);
  if (status === "Sold Out") return NextResponse.json({ error: "This date is sold out. Please pick another date." }, { status: 409 });
  const isWaitlist = status === "Waitlist";

  const count = Math.min(20, Math.max(1, Math.floor(Number(body.count) || 1)));
  if (!isWaitlist && count > seatsLeft(batch)) {
    return NextResponse.json({ error: `Only ${seatsLeft(batch)} seats left on this date.` }, { status: 409 });
  }
  const pickup = clean(body.pickup);
  if (!trip.pickupPrices.some((p) => p.pickup === pickup)) return NextResponse.json({ error: "Please choose a pickup point." }, { status: 400 });
  const stayOption = clean(body.stayOption);

  // Travellers
  const raw: Partial<Traveller>[] = Array.isArray(body.travellers) ? body.travellers.slice(0, count) : [];
  if (raw.length !== count) return NextResponse.json({ error: "Please fill in details for every traveller." }, { status: 400 });
  const travellers: Traveller[] = raw.map((t) => ({
    name: clean(t.name, 100),
    age: Number(t.age) || "",
    gender: (["Male", "Female", "Other"].includes(String(t.gender)) ? t.gender : "") as Traveller["gender"],
    phone: clean(t.phone, 20),
    email: clean(t.email, 120),
    emergencyName: clean(t.emergencyName, 100),
    emergencyPhone: clean(t.emergencyPhone, 20),
    idType: clean(t.idType, 40),
    medicalNotes: clean(t.medicalNotes, 500),
  }));
  const lead = travellers[0];
  if (travellers.some((t) => !t.name || !t.age || !t.phone)) {
    return NextResponse.json({ error: "Name, age and phone are needed for every traveller." }, { status: 400 });
  }
  if (!lead.email || !lead.emergencyPhone) {
    return NextResponse.json({ error: "Please add your email and an emergency contact." }, { status: 400 });
  }

  // Price is always calculated on the server
  let coupon = body.couponCode ? await getCoupon(clean(body.couponCode, 40)) : null;
  if (coupon && couponError(coupon, trip.slug, count)) coupon = null;
  const paymentOption = body.paymentOption === "advance" ? "advance" : "full";
  const price = calculatePrice({ trip, pickup, stayOption, count, coupon, paymentOption });

  const booking: Booking = {
    id: "",
    bookingCode: newBookingCode(site.bookingPrefix),
    tripId: trip.id,
    batchId: batch.id,
    tripName: trip.name,
    tripSlug: trip.slug,
    batchStart: batch.startDate,
    batchEnd: batch.endDate,
    pickup,
    stayOption,
    travellersCount: count,
    travellers,
    contactName: lead.name,
    contactPhone: lead.phone,
    contactEmail: lead.email,
    perPerson: price.perPerson + price.stayExtra,
    baseAmount: price.subtotal,
    groupDiscount: price.groupDiscount,
    couponCode: coupon?.code ?? "",
    couponDiscount: price.couponDiscount,
    totalAmount: price.total,
    paymentOption: price.advanceAvailable ? paymentOption : "full",
    amountDueNow: isWaitlist ? 0 : price.payNow,
    amountPaid: 0,
    status: isWaitlist ? "waitlist" : "pending",
    paymentStatus: "pending",
    isDemo: !isRazorpayConfigured(),
    createdAt: new Date().toISOString(),
  };

  try {
    const saved = await createBooking(booking);

    if (isWaitlist) {
      await notifyBookingConfirmed(saved, trip, "");
      return NextResponse.json({ waitlist: true, booking: saved });
    }

    if (!isRazorpayConfigured()) {
      // Test mode: no real payment is taken
      return NextResponse.json({ demo: true, booking: saved });
    }

    const order = await createRazorpayOrder(saved.amountDueNow, saved.bookingCode, {
      booking_id: saved.id,
      booking_code: saved.bookingCode,
      trip: trip.name,
    });
    await updateBooking(saved.id, { razorpayOrderId: order.id });
    return NextResponse.json({
      booking: saved,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again or WhatsApp us." }, { status: 500 });
  }
}
