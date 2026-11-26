"use client";

/**
 * PICK A WEEKEND
 * The next weekends as chips; choosing one lists the trips that leave then.
 */
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import Img from "../Img";

export interface PlannerTrip {
  batchId: string;
  name: string;
  image: string;
  dates: string;
  pickup: string;
  duration: string;
  difficulty: string;
  price: string;
  seatsLeft: number;
  waitlist: boolean;
  href: string;
  bookHref: string;
}

export interface PlannerWeekend {
  key: string;
  label: string; // "29–30 Nov"
  tag: string; // "This weekend"
  trips: PlannerTrip[];
}

export default function WeekendPlanner({ weekends }: { weekends: PlannerWeekend[] }) {
  const first = weekends.findIndex((w) => w.trips.length > 0);
  const [sel, setSel] = useState(first < 0 ? 0 : first);
  const w = weekends[sel];

  return (
    <div>
      <div className="rail" role="tablist" aria-label="Weekends">
        {weekends.map((wk, i) => (
          <button
            key={wk.key}
            type="button"
            role="tab"
            aria-selected={i === sel}
            onClick={() => setSel(i)}
            className={`flex w-[8.5rem] shrink-0 flex-col items-start rounded-2xl border px-4 py-3 text-left transition-colors ${
              i === sel ? "border-forest-900 bg-forest-900 text-white" : "border-mountain-200 bg-white text-forest-900 hover:border-forest-400"
            }`}
          >
            <span className={`text-xs font-semibold ${i === sel ? "text-sunset-300" : "text-mountain-500"}`}>{wk.tag}</span>
            <span className="mt-0.5 text-lg font-extrabold leading-tight">{wk.label}</span>
            <span className={`mt-1 text-xs ${i === sel ? "text-white/70" : "text-mountain-500"}`}>
              {wk.trips.length ? `${wk.trips.length} ${wk.trips.length === 1 ? "trip" : "trips"}` : "No trips yet"}
            </span>
          </button>
        ))}
      </div>

      <div key={w?.key} className="mt-5 grid animate-fade-up gap-3 md:grid-cols-2">
        {w && w.trips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-mountain-200 p-6 text-mountain-600 md:col-span-2">
            Nothing scheduled for this weekend yet.{" "}
            <Link href="/plan-a-trip" className="font-semibold text-forest-700 underline">
              Plan a private trip for your group
            </Link>
            .
          </div>
        )}
        {w?.trips.map((t) => (
          <article key={t.batchId} className="flex gap-4 rounded-2xl border border-mountain-100 bg-white p-3 transition-shadow hover:shadow-lg hover:shadow-forest-900/5">
            <Link href={t.href} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-forest-100 sm:h-32 sm:w-36">
              <Img src={t.image} alt={t.name} sizes="150px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-[17px] font-bold leading-snug">
                <Link href={t.href} className="hover:text-forest-600">{t.name}</Link>
              </h3>
              <ul className="mt-1 space-y-0.5 text-[13px] text-mountain-600">
                <li className="flex items-center gap-1.5"><CalendarDays size={13} className="shrink-0" /> {t.dates}</li>
                <li className="flex items-center gap-1.5"><MapPin size={13} className="shrink-0" /> <span className="truncate">{t.pickup}</span></li>
                <li className="flex items-center gap-1.5"><Clock size={13} className="shrink-0" /> {t.duration}, {t.difficulty}</li>
              </ul>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                <p className="leading-tight">
                  <span className="text-lg font-extrabold text-forest-900">{t.price}</span>
                  <span className="block text-xs text-mountain-500">
                    {t.waitlist ? "Batch full" : t.seatsLeft <= 10 ? <span className="font-semibold text-sunset-600">{t.seatsLeft} seats left</span> : `${t.seatsLeft} seats left`}
                  </span>
                </p>
                <Link href={t.bookHref} className={t.waitlist ? "btn-outline px-4 py-2 text-sm" : "btn-primary px-4 py-2 text-sm"}>
                  {t.waitlist ? "Waitlist" : "Book"}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
