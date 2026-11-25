import { NextResponse } from "next/server";
import { getBooking, isSupabaseConfigured } from "@/lib/data";
import type { Booking } from "@/lib/types";
import { markBookingPaid } from "@/lib/booking-server";
import { isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";

/** Step 2 of payment: called by the browser after Razorpay says the payment worked */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const booking = await getBooking(String(body.bookingId || ""));

  // Demo mode on Vercel (no database, no Razorpay): the booking may have been kept
  // in another server's memory, so confirm the copy sent by the browser. No money is involved.
  if (!booking && body.demo && !isRazorpayConfigured() && !isSupabaseConfigured() && body.booking) {
    const b = body.booking as Booking;
    const paidFull = b.amountDueNow >= b.totalAmount;
    return NextResponse.json({ ok: true, booking: { ...b, status: "confirmed", paymentStatus: paidFull ? "paid" : "advance", amountPaid: b.amountDueNow, razorpayPaymentId: "test_payment" } });
  }
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (!isRazorpayConfigured()) {
    // Test mode only — real payments always need a valid signature
    if (!body.demo) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const updated = await markBookingPaid(booking.id, "test_payment");
    return NextResponse.json({ ok: true, booking: updated });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || razorpay_order_id !== booking.razorpayOrderId) {
    return NextResponse.json({ error: "Payment does not match this booking" }, { status: 400 });
  }
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }
  const updated = await markBookingPaid(booking.id, razorpay_payment_id);
  return NextResponse.json({ ok: true, booking: updated });
}
