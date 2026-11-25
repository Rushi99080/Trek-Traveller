import Link from "next/link";
import { CopyPlus, ExternalLink, Pencil } from "lucide-react";
import { getTrips } from "@/lib/data";
import { dateRange, fromPrice, inr, nextBatch, upcomingBatches } from "@/lib/format";
import { PageTitle } from "@/components/admin/ui";
import { duplicateTripAction } from "../../actions";

export default async function AdminTrips() {
  const trips = await getTrips({ includeUnpublished: true });
  return (
    <>
      <PageTitle title="Trips & batches">
        <Link href="/admin/trips/new" className="btn-primary py-2.5 text-sm">Add trip</Link>
      </PageTitle>
      <ul className="grid gap-3">
        {trips.map((t) => {
          const next = nextBatch(t);
          const upcoming = upcomingBatches(t);
          return (
            <li key={t.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-forest-900">
                  {t.name}
                  {!t.isPublished && <span className="rounded-full bg-mountain-100 px-2 py-0.5 text-xs font-semibold text-mountain-600">Hidden</span>}
                </p>
                <p className="text-sm text-mountain-500">
                  From {inr(fromPrice(t))} | {upcoming.length} upcoming {upcoming.length === 1 ? "batch" : "batches"}
                  {next ? ` | next ${dateRange(next.startDate, next.endDate)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/trips/${t.id}`} className="btn-outline px-4 py-2 text-sm"><Pencil size={15} /> Edit</Link>
                <form action={duplicateTripAction.bind(null, t.id)}>
                  <button className="btn-outline px-4 py-2 text-sm" title="Make a copy of this trip"><CopyPlus size={15} /> Duplicate</button>
                </form>
                <Link href={`/treks/${t.slug}`} target="_blank" className="rounded-full p-2 text-mountain-500 hover:text-forest-700" aria-label="View on website"><ExternalLink size={18} /></Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
