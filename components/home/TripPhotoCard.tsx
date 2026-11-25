import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Img from "../Img";
import type { Trip } from "@/lib/types";
import { dateRange, fromPrice, inr, nextBatch, seatsLeft } from "@/lib/format";
import { categoryLabel } from "@/data/content";

/** Large photo card used on the homepage */
export default function TripPhotoCard({ trip, className = "" }: { trip: Trip; className?: string }) {
  const next = nextBatch(trip);
  const left = next ? seatsLeft(next) : 0;
  return (
    <Link href={`/treks/${trip.slug}`} className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.25rem] bg-forest-800 p-4 sm:p-5 ${className}`}>
      <Img src={trip.images[0]} alt={trip.name} sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />
      <div className="relative flex items-start justify-between gap-2">
        <span className="rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{categoryLabel(trip.categories[0])}</span>
        {left > 0 && left <= 10 && <span className="rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-bold text-white">{left} seats left</span>}
      </div>
      <div className="relative">
        <h3 className="text-xl font-bold leading-snug text-white sm:text-2xl">{trip.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80">{trip.shortDescription}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="text-white">
            <p className="flex items-center gap-1.5 text-xs text-white/75">
              <CalendarDays size={13} /> {next ? dateRange(next.startDate, next.endDate) : "New dates soon"} | {trip.durationLabel}
            </p>
            <p className="mt-0.5 text-lg font-bold">From {inr(fromPrice(trip))}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-forest-900 transition-transform group-hover:rotate-45">
            <ArrowUpRight size={20} />
          </span>
        </div>
      </div>
    </Link>
  );
}
