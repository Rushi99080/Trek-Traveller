import Link from "next/link";
import { ChevronDown, FileSpreadsheet, Printer } from "lucide-react";
import { getTrips, listBookings } from "@/lib/data";
import { dateRange, inr } from "@/lib/format";
import { site } from "@/site.config";
import { BookingStatusText, PageTitle, PaymentPill } from "@/components/admin/ui";
import BookingActions from "@/components/admin/BookingActions";

type SP = Promise<{ trip?: string; batch?: string; payment?: string; status?: string; q?: string }>;

export default async function AdminBookings({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [trips, bookings] = await Promise.all([
    getTrips({ includeUnpublished: true }),
    listBookings({ tripId: sp.trip, batchId: sp.batch, paymentStatus: sp.payment, status: sp.status, q: sp.q }),
  ]);
  const batchOptions = trips.flatMap((t) => t.batches.map((b) => ({ id: b.id, label: `${t.name} — ${dateRange(b.startDate, b.endDate)}`, date: b.startDate, link: b.whatsappGroupLink })));
  batchOptions.sort((a, z) => a.date.localeCompare(z.date));
  const linkFor = (batchId: string) => batchOptions.find((b) => b.id === batchId)?.link || site.whatsappCommunity;
  const travellers = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.travellersCount, 0);
  const received = bookings.reduce((s, b) => s + (b.paymentStatus === "refunded" ? 0 : b.amountPaid), 0);

  return (
    <>
      <PageTitle title="Bookings">
        {sp.batch && (
          <>
            <a href={`/api/admin/participants?batch=${sp.batch}`} className="btn-outline px-4 py-2 text-sm"><FileSpreadsheet size={16} /> Participants (Excel)</a>
            <Link href={`/admin/participants?batch=${sp.batch}`} className="btn-outline px-4 py-2 text-sm"><Printer size={16} /> Participants (PDF)</Link>
          </>
        )}
      </PageTitle>

      <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
        <input name="q" defaultValue={sp.q} placeholder="Name, phone, email or ID" className="input py-2.5 lg:col-span-1" aria-label="Search" />
        <select name="trip" defaultValue={sp.trip ?? ""} className="input py-2.5" aria-label="Trip">
          <option value="">All trips</option>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select name="batch" defaultValue={sp.batch ?? ""} className="input py-2.5" aria-label="Batch">
          <option value="">All batches</option>
          {batchOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <select name="payment" defaultValue={sp.payment ?? ""} className="input py-2.5" aria-label="Payment status">
          <option value="">Any payment</option>
          <option value="paid">Paid</option>
          <option value="advance">Advance</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="flex gap-2">
          <select name="status" defaultValue={sp.status ?? ""} className="input py-2.5" aria-label="Booking status">
            <option value="">Any status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending (not paid)</option>
            <option value="waitlist">Waitlist</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn-forest shrink-0 px-4 py-2.5 text-sm">Filter</button>
        </div>
      </form>

      <p className="mt-4 text-sm text-mountain-500">
        {bookings.length} bookings | {travellers} confirmed travellers | {inr(received)} received
        {(sp.q || sp.trip || sp.batch || sp.payment || sp.status) && <> | <Link href="/admin/bookings" className="font-semibold text-forest-700">Clear filters</Link></>}
      </p>

      <ul className="mt-3 space-y-3">
        {bookings.map((b) => (
          <li key={b.id}>
            <details className="card group">
              <summary className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-forest-900">
                    {b.contactName} <span className="font-normal text-mountain-500">× {b.travellersCount}</span>
                    {b.isDemo && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">TEST</span>}
                  </p>
                  <p className="text-sm text-mountain-500">{b.bookingCode} | {b.tripName}, {dateRange(b.batchStart, b.batchEnd)} | {b.pickup}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <PaymentPill s={b.paymentStatus} />
                    <p className="mt-0.5 text-sm"><strong>{inr(b.amountPaid)}</strong> <span className="text-mountain-500">/ {inr(b.totalAmount)}</span></p>
                    <BookingStatusText s={b.status} />
                  </div>
                  <ChevronDown size={18} className="text-mountain-400 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="grid gap-6 border-t border-mountain-100 p-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="text-mountain-500">
                      <tr><th className="pb-2 font-semibold">Traveller</th><th className="pb-2 font-semibold">Phone</th><th className="pb-2 font-semibold">Emergency</th><th className="pb-2 font-semibold">ID / medical</th></tr>
                    </thead>
                    <tbody className="divide-y divide-mountain-100">
                      {b.travellers.map((t, i) => (
                        <tr key={i} className="align-top">
                          <td className="py-2 pr-3"><strong>{t.name}</strong><br /><span className="text-mountain-500">{t.age}, {t.gender}</span></td>
                          <td className="py-2 pr-3">{t.phone}<br /><span className="text-mountain-500">{t.email}</span></td>
                          <td className="py-2 pr-3">{t.emergencyName}<br /><span className="text-mountain-500">{t.emergencyPhone}</span></td>
                          <td className="py-2">{t.idType}{t.medicalNotes && <><br /><span className="text-red-700">{t.medicalNotes}</span></>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-mountain-500">
                    Booked {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    {b.stayOption && ` | ${b.stayOption}`}
                    {b.couponCode && ` | coupon ${b.couponCode} (−${inr(b.couponDiscount)})`}
                    {b.groupDiscount > 0 && ` | group discount −${inr(b.groupDiscount)}`}
                    {b.razorpayPaymentId && ` | payment ${b.razorpayPaymentId}`}
                  </p>
                  {(b.paymentStatus === "paid" || b.paymentStatus === "advance") && (
                    <Link href={`/booking/invoice?id=${b.id}`} target="_blank" className="mt-2 inline-block text-sm font-semibold text-forest-700">Open invoice</Link>
                  )}
                </div>
                <BookingActions b={b} groupLink={linkFor(b.batchId)} />
              </div>
            </details>
          </li>
        ))}
        {bookings.length === 0 && <li className="card p-6 text-center text-mountain-500">No bookings match these filters.</li>}
      </ul>
    </>
  );
}
