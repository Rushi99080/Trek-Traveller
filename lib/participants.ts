import "server-only";
import { getTrips, listBookings } from "./data";
import type { Batch, Booking, Trip } from "./types";

/** Confirmed travellers for one batch, for trek leaders */
export async function getParticipants(batchId: string) {
  const trips = await getTrips({ includeUnpublished: true });
  let trip: Trip | undefined;
  let batch: Batch | undefined;
  for (const t of trips) {
    const b = t.batches.find((x) => x.id === batchId);
    if (b) {
      trip = t;
      batch = b;
      break;
    }
  }
  const bookings = (await listBookings({ batchId })).filter((b) => b.status === "confirmed" || b.status === "waitlist");
  const rows = bookings.flatMap((b: Booking) =>
    b.travellers.map((t, i) => ({
      booking: b,
      isLead: i === 0,
      traveller: t,
      status: b.status,
    })),
  );
  rows.sort((a, z) => (a.status === z.status ? a.booking.pickup.localeCompare(z.booking.pickup) : a.status === "confirmed" ? -1 : 1));
  return { trip, batch, rows };
}
