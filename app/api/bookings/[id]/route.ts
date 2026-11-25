import { NextResponse } from "next/server";
import { getBatch, getBooking, getTripBySlug } from "@/lib/data";
import { site } from "@/site.config";

/** Booking details for the confirmation and invoice pages */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const [trip, batch] = await Promise.all([getTripBySlug(booking.tripSlug), getBatch(booking.batchId)]);
  return NextResponse.json({
    booking,
    trip: { meetingPoints: trip?.meetingPoints ?? [] },
    groupLink: booking.status === "confirmed" ? batch?.whatsappGroupLink || site.whatsappCommunity : "",
  });
}
