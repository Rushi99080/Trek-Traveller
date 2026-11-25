import "server-only";
import crypto from "node:crypto";

/** True when Razorpay keys are added. Without them, the site uses a test checkout. */
export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder(amountRupees: number, receipt: string, notes: Record<string, string>) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100), // Razorpay uses paise
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${text}`);
  }
  return (await res.json()) as { id: string; amount: number; currency: string };
}

/** Checks that the payment really came from Razorpay */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b || "");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
