import "server-only";
import { revalidatePath } from "next/cache";
import { confirmSeats, getBatch, getBooking, getTripBySlug, updateBooking } from "./data";
import { notifyBookingConfirmed } from "./notify";
import { site } from "@/site.config";
import type { Booking } from "./types";

/** Marks a booking as paid, updates seats and sends confirmations. Safe to call twice. */
export async function markBookingPaid(bookingId: string, paymentId?: string): Promise<Booking | null> {
  const existing = await getBooking(bookingId);
  if (!existing) return null;
  if (existing.status === "confirmed") return existing; // already done (e.g. webhook arrived first)

  const paidFull = existing.amountDueNow >= existing.totalAmount;
  const updated = await updateBooking(bookingId, {
    status: "confirmed",
    paymentStatus: paidFull ? "paid" : "advance",
    amountPaid: existing.amountDueNow,
    razorpayPaymentId: paymentId,
  });
  await confirmSeats(bookingId);
  if (updated) {
    const [trip, batch] = await Promise.all([getTripBySlug(updated.tripSlug), getBatch(updated.batchId)]);
    await notifyBookingConfirmed(updated, trip, batch?.whatsappGroupLink || site.whatsappCommunity);
    try {
      revalidatePath(`/treks/${updated.tripSlug}`);
      revalidatePath("/treks");
      revalidatePath("/");
    } catch {
      // not available in every context
    }
  }
  return updated;
}
