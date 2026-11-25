import { NextResponse } from "next/server";
import { getBookingByOrderId } from "@/lib/data";
import { markBookingPaid } from "@/lib/booking-server";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay webhook (backup): confirms bookings even if the traveller
 * closes the browser right after paying.
 * Razorpay Dashboard → Settings → Webhooks → URL: https://YOURSITE/api/payments/webhook
 * Events: payment.captured, order.paid. Use the same secret as RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id || event.payload?.order?.entity?.id;
    if (orderId) {
      const booking = await getBookingByOrderId(orderId);
      if (booking) await markBookingPaid(booking.id, payment?.id);
    }
  }
  return NextResponse.json({ ok: true });
}
