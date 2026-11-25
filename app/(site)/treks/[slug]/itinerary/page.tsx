import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripBySlug, getTrips } from "@/lib/data";
import { dateRange, inr, upcomingBatches } from "@/lib/format";
import { cancellationPolicy } from "@/data/content";
import { site } from "@/site.config";
import PrintButton from "@/components/PrintButton";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  return { title: trip ? `${trip.name} — itinerary` : "Itinerary", robots: { index: false } };
}

/** Print-friendly itinerary. Visitors save it as a PDF from the browser. */
export default async function ItineraryPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();
  const batches = upcomingBatches(trip).slice(0, 4);

  return (
    <div className="container-site max-w-3xl py-8 print:py-0">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/treks/${trip.slug}`} className="font-semibold text-forest-700">Back to trip</Link>
        <PrintButton />
      </div>

      <article className="rounded-card bg-white p-6 ring-1 ring-mountain-100 sm:p-10 print:p-0 print:ring-0">
        <header className="flex items-start justify-between gap-4 border-b border-mountain-200 pb-5">
          <div>
            <p className="font-display text-lg font-bold text-forest-800">{site.name}</p>
            <p className="text-sm text-mountain-500">{site.phone} | {site.email}</p>
          </div>
          <p className="text-right text-sm text-mountain-500">Trip itinerary</p>
        </header>

        <h1 className="mt-6 text-3xl font-extrabold">{trip.name}</h1>
        <p className="mt-1 text-mountain-600">{trip.location}, {trip.durationLabel}, {trip.difficulty}</p>

        <table className="mt-5 w-full text-left text-sm">
          <tbody className="divide-y divide-mountain-100">
            {[
              ["Altitude", trip.altitude],
              ["Distance", trip.distance],
              ["Best season", trip.bestSeason],
              ["Upcoming dates", batches.map((b) => dateRange(b.startDate, b.endDate)).join(", ") || "—"],
              ["Price per person", trip.pickupPrices.map((p) => `${p.pickup}: ${inr(p.price)}`).join(" | ")],
            ].map(([k, v]) => (
              <tr key={k}>
                <th className="w-40 py-2 pr-4 font-semibold text-mountain-600">{k}</th>
                <td className="py-2 text-mountain-800">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-8 text-xl font-bold">Day-wise plan</h2>
        {trip.itinerary.map((d, i) => (
          <section key={i} className="mt-4 break-inside-avoid">
            <h3 className="font-display font-semibold text-forest-800">{d.label} — {d.title}</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-mountain-700">
              {d.points.map((p, k) => <li key={k}>{p}</li>)}
            </ul>
          </section>
        ))}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold">Included</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mountain-700">{trip.inclusions.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold">Not included</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mountain-700">{trip.exclusions.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        </div>

        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">Pickup points</h2>
          <ul className="mt-2 space-y-1 text-sm text-mountain-700">
            {trip.meetingPoints.map((m) => (
              <li key={m.city + m.place}><strong>{m.city}:</strong> {m.place} — {m.time}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">Things to carry</h2>
          <ul className="mt-2 grid list-disc gap-x-6 gap-y-1 pl-5 text-sm text-mountain-700 sm:grid-cols-2 print:grid-cols-2">
            {trip.thingsToCarry.map((x) => <li key={x}>{x}</li>)}
          </ul>
          {trip.fitness && <p className="mt-3 text-sm text-mountain-700"><strong>Fitness:</strong> {trip.fitness}</p>}
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">Cancellation & refund</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mountain-700">{cancellationPolicy.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>

        <footer className="mt-10 border-t border-mountain-200 pt-4 text-xs text-mountain-500">
          {site.legalName}, {site.address}, {site.url}
        </footer>
      </article>
    </div>
  );
}
