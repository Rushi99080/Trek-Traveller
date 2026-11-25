import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import type { Trip } from "@/lib/types";
import { batchDisplayStatus, dateRange, fromPrice, inr, nextBatch, seatsLeft } from "@/lib/format";
import { DifficultyBadge } from "./Badges";
import Img from "./Img";

export default function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const next = nextBatch(trip);
  const status = next ? batchDisplayStatus(next) : null;
  const left = next ? seatsLeft(next) : 0;
  const href = `/treks/${trip.slug}`;

  return (
    <article className={`card group flex flex-col overflow-hidden ${compact ? "w-[78vw] max-w-[300px] shrink-0" : ""}`}>
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-forest-100">
        <Img src={trip.images[0]} alt={trip.name} sizes="(max-width: 640px) 80vw, 320px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        {status === "Waitlist" || status === "Sold Out" ? (
          <span className="absolute left-3 top-3 rounded-full bg-mountain-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            {status === "Waitlist" ? "Full — join waitlist" : "Sold out"}
          </span>
        ) : left > 0 && left <= 10 ? (
          <span className="absolute left-3 top-3 rounded-full bg-sunset-500 px-2.5 py-1 text-xs font-semibold text-white">
            Only {left} {left === 1 ? "seat" : "seats"} left
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <DifficultyBadge level={trip.difficulty} />
          <span className="flex items-center gap-1 text-[13px] text-mountain-500">
            <Clock size={14} /> {trip.durationLabel}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-snug">
          <Link href={href} className="hover:text-forest-600">
            {trip.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-mountain-500">
          <CalendarDays size={14} />
          {next ? `Next: ${dateRange(next.startDate, next.endDate)}` : "New dates coming soon"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="leading-tight">
            <span className="block text-xs text-mountain-500">From</span>
            <span className="font-display text-xl font-bold text-forest-800">{inr(fromPrice(trip))}</span>
          </p>
          <Link href={next ? `/book/${trip.slug}?batch=${next.id}` : href} className="btn-primary px-4 py-2.5 text-sm">
            {status === "Waitlist" ? "Join waitlist" : "Book now"}
          </Link>
        </div>
      </div>
    </article>
  );
}
