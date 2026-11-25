import Link from "next/link";
import { getParticipants } from "@/lib/participants";
import { dateRange } from "@/lib/format";
import { site } from "@/site.config";
import PrintButton from "@/components/PrintButton";

/** Printable participant list (save as PDF) for trek leaders */
export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  const { batch: batchId = "" } = await searchParams;
  const { trip, batch, rows } = await getParticipants(batchId);
  if (!batch || !trip) return <p className="card p-6">Batch not found. <Link href="/admin" className="font-semibold text-forest-700">Back</Link></p>;
  const confirmed = rows.filter((r) => r.status === "confirmed");
  const waitlist = rows.filter((r) => r.status === "waitlist");
  const byPickup = confirmed.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.booking.pickup]: (acc[r.booking.pickup] ?? 0) + 1 }), {});

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/bookings?batch=${batch.id}`} className="font-semibold text-forest-700">Back to bookings</Link>
        <PrintButton label="Save as PDF" />
      </div>
      <div className="bg-white p-4 sm:p-6 print:p-0">
        <p className="text-sm text-mountain-500">{site.name} | Participant list</p>
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        <p className="text-mountain-600">
          {dateRange(batch.startDate, batch.endDate)} | {confirmed.length} confirmed
          {Object.entries(byPickup).map(([k, v]) => ` | ${k}: ${v}`).join("")}
        </p>
        <table className="mt-4 w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b-2 border-mountain-300">
              {["#", "Name", "Age/Sex", "Phone", "Emergency", "Pickup", "Medical", "Balance"].map((h) => <th key={h} className="py-1.5 pr-2 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {confirmed.map((r, i) => (
              <tr key={i} className="border-b border-mountain-100 align-top">
                <td className="py-1.5 pr-2">{i + 1}</td>
                <td className="py-1.5 pr-2 font-semibold">{r.traveller.name}<div className="text-[11px] font-normal text-mountain-500">{r.booking.bookingCode}</div></td>
                <td className="py-1.5 pr-2">{r.traveller.age}/{r.traveller.gender.charAt(0)}</td>
                <td className="py-1.5 pr-2">{r.traveller.phone}</td>
                <td className="py-1.5 pr-2">{r.traveller.emergencyName}<div className="text-mountain-500">{r.traveller.emergencyPhone}</div></td>
                <td className="py-1.5 pr-2">{r.booking.pickup}</td>
                <td className="py-1.5 pr-2 text-red-700">{r.traveller.medicalNotes}</td>
                <td className="py-1.5">{r.isLead && r.booking.totalAmount > r.booking.amountPaid ? `₹${(r.booking.totalAmount - r.booking.amountPaid).toLocaleString("en-IN")}` : ""}</td>
              </tr>
            ))}
            {confirmed.length === 0 && <tr><td colSpan={8} className="py-4 text-mountain-500">No confirmed travellers yet.</td></tr>}
          </tbody>
        </table>
        {waitlist.length > 0 && (
          <>
            <h2 className="mt-6 text-lg font-bold">Waitlist</h2>
            <ol className="mt-1 list-decimal pl-5 text-sm">
              {waitlist.map((r, i) => <li key={i}>{r.traveller.name} | {r.traveller.phone} | {r.booking.bookingCode}</li>)}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
