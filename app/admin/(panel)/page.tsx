import Link from "next/link";
import { FileSpreadsheet, Printer } from "lucide-react";
import { getTrips, listBookings, listEnquiries } from "@/lib/data";
import { dateRange, inr, todayISO, toISODate, upcomingBatches } from "@/lib/format";
import { FillBar, PageTitle, PaymentPill } from "@/components/admin/ui";

export default async function Dashboard() {
  const [trips, bookings, enquiries] = await Promise.all([getTrips({ includeUnpublished: true }), listBookings(), listEnquiries()]);
  const month = todayISO().slice(0, 7);
  const thisMonth = bookings.filter((b) => b.createdAt.slice(0, 7) === month && (b.status === "confirmed" || b.paymentStatus === "refunded"));
  const confirmedThisMonth = thisMonth.filter((b) => b.status === "confirmed");
  const revenue = confirmedThisMonth.reduce((s, b) => s + b.amountPaid, 0);
  const travellers = confirmedThisMonth.reduce((s, b) => s + b.travellersCount, 0);
  const newEnq = enquiries.filter((e) => e.status === "new").length;
  const pendingBalance = bookings.filter((b) => b.status === "confirmed" && b.totalAmount > b.amountPaid).reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0);

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 21);
  const until = toISODate(horizon);
  const departures = trips
    .flatMap((t) => upcomingBatches(t).map((b) => ({ t, b })))
    .filter(({ b }) => b.startDate <= until)
    .sort((a, z) => a.b.startDate.localeCompare(z.b.startDate));

  const byTrip = new Map<string, { name: string; count: number; amount: number }>();
  confirmedThisMonth.forEach((b) => {
    const r = byTrip.get(b.tripSlug) ?? { name: b.tripName, count: 0, amount: 0 };
    r.count += b.travellersCount;
    r.amount += b.amountPaid;
    byTrip.set(b.tripSlug, r);
  });

  const stats = [
    { label: "Received this month", value: inr(revenue) },
    { label: "Travellers booked this month", value: String(travellers) },
    { label: "Balance to collect", value: inr(pendingBalance) },
    { label: "New enquiries", value: String(newEnq), href: "/admin/enquiries?status=new" },
  ];

  return (
    <>
      <PageTitle title="Dashboard">
        <Link href="/admin/trips/new" className="btn-primary py-2.5 text-sm">Add trip</Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <p className="text-sm text-mountain-500">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-forest-900 sm:text-3xl">{s.value}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="card p-4 hover:border-forest-300">{inner}</Link>
          ) : (
            <div key={s.label} className="card p-4">{inner}</div>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Departures in the next 3 weeks</h2>
        <div className="card mt-3 divide-y divide-mountain-100">
          {departures.length === 0 && <p className="p-4 text-mountain-500">No departures in the next 3 weeks.</p>}
          {departures.map(({ t, b }) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-forest-900">{t.name}</p>
                <p className="text-sm text-mountain-500">{dateRange(b.startDate, b.endDate)}</p>
              </div>
              <div className="flex items-center gap-4">
                <FillBar booked={b.seatsBooked} total={b.totalSeats} />
                <Link href={`/admin/bookings?batch=${b.id}`} className="text-sm font-semibold text-forest-700">Bookings</Link>
                <a href={`/api/admin/participants?batch=${b.id}`} className="flex items-center gap-1 text-sm font-semibold text-forest-700" title="Download participant list for Excel">
                  <FileSpreadsheet size={16} /> Excel
                </a>
                <Link href={`/admin/participants?batch=${b.id}`} className="flex items-center gap-1 text-sm font-semibold text-forest-700" title="Printable participant list">
                  <Printer size={16} /> PDF
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Latest bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-semibold text-forest-700">See all</Link>
          </div>
          <ul className="card mt-3 divide-y divide-mountain-100">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-forest-900">{b.contactName} <span className="font-normal text-mountain-500">× {b.travellersCount}</span></p>
                  <p className="truncate text-sm text-mountain-500">{b.tripName}, {dateRange(b.batchStart, b.batchEnd)}</p>
                </div>
                <div className="text-right">
                  <PaymentPill s={b.paymentStatus} />
                  <p className="mt-1 text-sm font-semibold">{inr(b.amountPaid)}</p>
                </div>
              </li>
            ))}
            {bookings.length === 0 && <li className="p-4 text-mountain-500">No bookings yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold">This month by trip</h2>
          <table className="card mt-3 w-full overflow-hidden text-left text-sm">
            <thead className="bg-mountain-50 text-mountain-600">
              <tr><th className="p-3 font-semibold">Trip</th><th className="p-3 text-right font-semibold">Travellers</th><th className="p-3 text-right font-semibold">Received</th></tr>
            </thead>
            <tbody className="divide-y divide-mountain-100">
              {Array.from(byTrip.values()).sort((a, z) => z.amount - a.amount).map((r) => (
                <tr key={r.name}><td className="p-3">{r.name}</td><td className="p-3 text-right tabular-nums">{r.count}</td><td className="p-3 text-right tabular-nums">{inr(r.amount)}</td></tr>
              ))}
              {byTrip.size === 0 && <tr><td className="p-3 text-mountain-500" colSpan={3}>No confirmed bookings this month yet.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
