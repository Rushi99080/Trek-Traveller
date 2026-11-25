"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Trip } from "@/lib/types";
import { fromPrice, monthKey, monthLabel, nextBatch, priceFor, upcomingBatches, cn } from "@/lib/format";
import { categories } from "@/data/content";
import { site } from "@/site.config";
import TripCard from "./TripCard";

const durations = [
  { key: "1", label: "1 day", test: (d: number) => d <= 1 },
  { key: "2-3", label: "2–3 days", test: (d: number) => d >= 2 && d <= 3 },
  { key: "4+", label: "4+ days", test: (d: number) => d >= 4 },
];
const prices = [
  { key: "0-1500", label: "Under ₹1,500", min: 0, max: 1500 },
  { key: "1500-5000", label: "₹1,500 – ₹5,000", min: 1500, max: 5000 },
  { key: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { key: "10000+", label: "₹10,000+", min: 10000, max: Infinity },
];
const sorts = [
  { key: "date", label: "Upcoming date" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "popular", label: "Most popular" },
];

type Filters = {
  q: string;
  type: string;
  region: string;
  month: string;
  duration: string;
  difficulty: string;
  price: string;
  pickup: string;
  sort: string;
};
const empty: Filters = { q: "", type: "", region: "", month: "", duration: "", difficulty: "", price: "", pickup: "", sort: "date" };

export default function TripsBrowser({ trips }: { trips: Trip[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [f, setF] = useState<Filters>(() => {
    const init = { ...empty };
    (Object.keys(empty) as (keyof Filters)[]).forEach((k) => {
      const v = params.get(k);
      if (v) init[k] = v;
    });
    return init;
  });
  const [sheet, setSheet] = useState(false);

  // Keep the URL in sync so filtered lists can be shared
  useEffect(() => {
    const sp = new URLSearchParams();
    (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
      if (f[k] && !(k === "sort" && f[k] === "date")) sp.set(k, f[k]);
    });
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [f, pathname, router]);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  const set = (k: keyof Filters, v: string) => setF((p) => ({ ...p, [k]: p[k] === v && k !== "sort" ? "" : v }));

  const regions = useMemo(() => Array.from(new Set(trips.map((t) => t.region))).sort(), [trips]);
  const months = useMemo(() => {
    const s = new Set<string>();
    trips.forEach((t) => upcomingBatches(t).forEach((b) => s.add(monthKey(b.startDate))));
    return Array.from(s).sort();
  }, [trips]);

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const price = prices.find((p) => p.key === f.price);
    const dur = durations.find((d) => d.key === f.duration);
    const list = trips.filter((t) => {
      if (q && !`${t.name} ${t.location} ${t.region}`.toLowerCase().includes(q)) return false;
      if (f.type && !t.categories.includes(f.type as Trip["categories"][number])) return false;
      if (f.region && t.region !== f.region) return false;
      if (f.difficulty && t.difficulty !== f.difficulty) return false;
      if (dur && !dur.test(t.durationDays)) return false;
      if (f.pickup && !t.pickupPrices.some((p) => p.pickup === f.pickup)) return false;
      if (f.month && !upcomingBatches(t).some((b) => monthKey(b.startDate) === f.month)) return false;
      if (price) {
        const p = f.pickup ? priceFor(t, f.pickup) : fromPrice(t);
        if (p < price.min || p >= price.max) return false;
      }
      return true;
    });
    const nextDate = (t: Trip) => nextBatch(t)?.startDate ?? "9999";
    const p = (t: Trip) => (f.pickup ? priceFor(t, f.pickup) : fromPrice(t));
    return list.sort((a, b) => {
      switch (f.sort) {
        case "price-asc":
          return p(a) - p(b);
        case "price-desc":
          return p(b) - p(a);
        case "popular":
          return b.popularity - a.popularity;
        default:
          return nextDate(a).localeCompare(nextDate(b));
      }
    });
  }, [trips, f]);

  const activeCount = (["region", "month", "duration", "difficulty", "price", "pickup"] as const).filter((k) => f[k]).length;

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
      active ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white text-mountain-700 hover:border-forest-400",
    );

  const FilterGroup = ({ title, k, options }: { title: string; k: keyof Filters; options: { key: string; label: string }[] }) => (
    <fieldset>
      <legend className="mb-2.5 font-display text-[15px] font-semibold text-forest-900">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.key} type="button" onClick={() => set(k, o.key)} className={chip(f[k] === o.key)} aria-pressed={f[k] === o.key}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  const panel = (
    <div className="space-y-6">
      <FilterGroup title="Region" k="region" options={regions.map((r) => ({ key: r, label: r }))} />
      <FilterGroup title="Month" k="month" options={months.map((m) => ({ key: m, label: monthLabel(m) }))} />
      <FilterGroup title="Duration" k="duration" options={durations} />
      <FilterGroup title="Difficulty" k="difficulty" options={["Easy", "Moderate", "Difficult"].map((d) => ({ key: d, label: d }))} />
      <FilterGroup title="Price per person" k="price" options={prices} />
      <FilterGroup title="Pickup city" k="pickup" options={site.pickupCities.map((c) => ({ key: c, label: c }))} />
    </div>
  );

  return (
    <div>
      {/* Search + type chips */}
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mountain-400" />
        <input
          value={f.q}
          onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
          placeholder="Search by trip or place"
          className="input pl-11"
          aria-label="Search trips"
        />
      </div>
      <div className="rail mt-4">
        <button type="button" onClick={() => setF((p) => ({ ...p, type: "" }))} className={cn(chip(!f.type), "shrink-0")}>
          All trips
        </button>
        {categories.map((c) => (
          <button key={c.slug} type="button" onClick={() => set("type", c.slug)} className={cn(chip(f.type === c.slug), "shrink-0 whitespace-nowrap")}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {panel}
            {activeCount > 0 && (
              <button type="button" onClick={() => setF({ ...empty, q: f.q, type: f.type, sort: f.sort })} className="mt-6 text-sm font-semibold text-sunset-600">
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-mountain-500" aria-live="polite">
              {results.length} {results.length === 1 ? "trip" : "trips"}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSheet(true)} className="btn-outline px-4 py-2 text-sm lg:hidden">
                <SlidersHorizontal size={16} /> Filters{activeCount ? ` (${activeCount})` : ""}
              </button>
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <select id="sort" value={f.sort} onChange={(e) => set("sort", e.target.value)} className="rounded-full border border-mountain-200 bg-white px-3 py-2 text-sm font-medium">
                {sorts.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {results.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <h2 className="text-xl font-bold">No trips match these filters</h2>
              <p className="mt-2 text-mountain-600">Try removing a filter, or tell us what you&apos;re looking for and we&apos;ll plan it.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setF(empty)} className="btn-outline">Clear all filters</button>
                <a href="/plan-a-trip" className="btn-primary">Plan a custom trip</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} aria-label="Close filters" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-mist">
            <div className="flex items-center justify-between border-b border-mountain-100 px-5 py-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setSheet(false)} className="rounded-full p-1.5" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{panel}</div>
            <div className="grid grid-cols-2 gap-3 border-t border-mountain-100 p-4">
              <button type="button" onClick={() => setF({ ...empty, q: f.q, type: f.type, sort: f.sort })} className="btn-outline">
                Clear
              </button>
              <button type="button" onClick={() => setSheet(false)} className="btn-forest">
                Show {results.length} {results.length === 1 ? "trip" : "trips"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
