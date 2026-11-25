import { getParticipants } from "@/lib/participants";
import { slugify } from "@/lib/format";

/** Participant list as a CSV file that opens in Excel / Google Sheets */
export async function GET(req: Request) {
  const batchId = new URL(req.url).searchParams.get("batch") || "";
  const { trip, batch, rows } = await getParticipants(batchId);
  if (!batch) return new Response("Batch not found", { status: 404 });

  const header = ["#", "Status", "Booking ID", "Name", "Age", "Gender", "Phone", "Email", "Emergency contact", "Emergency phone", "ID type", "Medical notes", "Pickup", "Stay", "Payment", "Balance due (booking)"];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r, i) =>
    [
      i + 1,
      r.status,
      r.booking.bookingCode,
      r.traveller.name,
      r.traveller.age,
      r.traveller.gender,
      r.traveller.phone,
      r.traveller.email,
      r.traveller.emergencyName,
      r.traveller.emergencyPhone,
      r.traveller.idType,
      r.traveller.medicalNotes,
      r.booking.pickup,
      r.booking.stayOption,
      r.booking.paymentStatus,
      r.isLead ? r.booking.totalAmount - r.booking.amountPaid : "",
    ].map(esc).join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  const name = `${slugify(trip?.name ?? "trip")}-${batch.startDate}-participants.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
