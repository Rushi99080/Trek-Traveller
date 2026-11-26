import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Bus, Check, Compass, Search, ShieldPlus, Star, Users } from "lucide-react";
import { getTrips } from "@/lib/data";
import {
  batchDisplayStatus,
  dateRange,
  fromPrice,
  inr,
  monthKey,
  monthLabel,
  nextBatch,
  parseDate,
  priceFor,
  seatsLeft,
  shortDate,
  toISODate,
  upcomingBatches,
} from "@/lib/format";
import { departureTime, parsePickup } from "@/lib/geo";
import { categories, hero, homeFaqs, instagramTiles, reviews, soloSteps, whyUs } from "@/data/content";
import { photos } from "@/data/photos";
import { site, whatsappLink } from "@/site.config";
import type { Trip } from "@/lib/types";
import Img from "@/components/Img";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { InstagramIcon } from "@/components/SocialIcons";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import HeroSlider, { type HeroSlide } from "@/components/home/HeroSlider";
import WeekendPlanner, { type PlannerWeekend } from "@/components/home/WeekendPlanner";
import TripCollections from "@/components/home/TripCollections";
import TripPhotoCard from "@/components/home/TripPhotoCard";

export const revalidate = 60;

const whyIcons = { Compass, ShieldPlus, Users, Bus, BadgeIndianRupee };

/** "9:30 pm pickup from Pune" / "11:30 pm the night before, from Mumbai" */
function pickupLine(trip: Trip) {
  const mp = trip.meetingPoints.find((m) => m.city === "Pune") ?? trip.meetingPoints[0];
  if (!mp) return "";
  const p = parsePickup(mp.time);
  const time = mp.time.replace(/\s*\(.*?\)\s*/g, "").trim();
  if (!p) return `Pickup from ${mp.city}`;
  return p.previousNight ? `${time} the night before, from ${mp.city}` : `${time} pickup from ${mp.city}`;
}

const punePrice = (t: Trip) => (t.pickupPrices.some((p) => p.pickup === "Pune") ? priceFor(t, "Pune") : fromPrice(t));

function nextMonths(n: number) {
  const d = new Date();
  return Array.from({ length: n }, (_, i) => {
    const key = monthKey(toISODate(new Date(d.getFullYear(), d.getMonth() + i, 1)));
    return { key, label: monthLabel(key) };
  });
}

export default async function HomePage() {
  const trips = await getTrips();
  const now = Date.now();

  // ---------- Upcoming departures ----------
  const departures = trips
    .flatMap((t) =>
      upcomingBatches(t).map((b) => {
        const mp = t.meetingPoints.find((m) => m.city === "Pune") ?? t.meetingPoints[0];
        return { trip: t, batch: b, at: departureTime(b.startDate, mp?.time), status: batchDisplayStatus(b) };
      }),
    )
    .filter((d) => d.status !== "Sold Out" && d.at.getTime() > now)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  // Hero: next five trips that still have seats, one slide per trip
  const seen = new Set<string>();
  const slides: HeroSlide[] = departures
    .filter((d) => d.status !== "Waitlist" && !seen.has(d.trip.id) && seen.add(d.trip.id))
    .slice(0, 5)
    .map((d) => ({
      id: d.batch.id,
      name: d.trip.name,
      location: d.trip.location,
      image: d.trip.images[0] ?? photos.fortRidge,
      date: shortDate(d.batch.startDate),
      pickup: pickupLine(d.trip),
      duration: d.trip.durationLabel,
      difficulty: d.trip.difficulty,
      altitude: d.trip.altitude && /\d/.test(d.trip.altitude) && !/^about/i.test(d.trip.altitude) ? d.trip.altitude : "",
      price: inr(punePrice(d.trip)),
      seatsLeft: seatsLeft(d.batch),
      href: `/treks/${d.trip.slug}`,
      bookHref: `/book/${d.trip.slug}?batch=${d.batch.id}`,
    }));

  // ---------- Weekends ----------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const sat0 = new Date(today);
  sat0.setDate(today.getDate() + (dow === 0 ? -1 : 6 - dow));
  const weekends: PlannerWeekend[] = Array.from({ length: 8 }, (_, i) => {
    const sat = new Date(sat0);
    sat.setDate(sat0.getDate() + i * 7);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return { key: toISODate(sat), label: dateRange(toISODate(sat), toISODate(sun)), tag: i === 0 ? "This weekend" : i === 1 ? "Next weekend" : "Weekend", trips: [] };
  });
  for (const d of departures) {
    const start = parseDate(d.batch.startDate);
    const sat = new Date(start);
    const sd = start.getDay();
    sat.setDate(start.getDate() + (sd === 0 ? -1 : 6 - sd));
    const wk = weekends.find((w) => w.key === toISODate(sat));
    if (!wk) continue;
    wk.trips.push({
      batchId: d.batch.id,
      name: d.trip.name,
      image: d.trip.images[0] ?? "",
      dates: dateRange(d.batch.startDate, d.batch.endDate),
      pickup: pickupLine(d.trip),
      duration: d.trip.durationLabel,
      difficulty: d.trip.difficulty,
      price: inr(punePrice(d.trip)),
      seatsLeft: seatsLeft(d.batch),
      waitlist: d.status === "Waitlist",
      href: `/treks/${d.trip.slug}`,
      bookHref: `/book/${d.trip.slug}?batch=${d.batch.id}`,
    });
  }

  // ---------- Trips by type ----------
  const bySoonest = [...trips].sort((a, b) => (nextBatch(a)?.startDate ?? "9999").localeCompare(nextBatch(b)?.startDate ?? "9999"));
  const card = (t: Trip) => <TripPhotoCard key={t.id} trip={t} className="w-[80vw] max-w-[22rem] shrink-0 sm:w-auto sm:max-w-none" />;
  const tabs = [
    { key: "all", label: "All trips", cards: bySoonest.slice(0, 6).map(card) },
    ...categories
      .filter((c) => c.slug !== "corporate-trips")
      .map((c) => ({ key: c.slug, label: c.label, cards: bySoonest.filter((t) => t.categories.includes(c.slug)).map(card) }))
      .filter((tab) => tab.cards.length > 0),
  ];

  // ---------- A day on the trail (cheapest one-day trek) ----------
  const dayTrip = trips
    .filter((t) => t.durationDays === 1 && (t.itinerary[0]?.points.length ?? 0) >= 4)
    .sort((a, b) => punePrice(a) - punePrice(b))[0];
  const timeline = dayTrip?.itinerary[0].points.map((p) => {
    const [time, ...rest] = p.split(/\s[–-]\s/);
    return rest.length ? { time, text: rest.join(" – ") } : { time: "", text: p };
  });
  const dayNext = dayTrip ? nextBatch(dayTrip) : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: site.name,
          url: site.url,
          telephone: site.phone,
          email: site.email,
          address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
          sameAs: [site.instagram, site.youtube, site.facebook],
        }}
      />

      {slides.length > 0 ? (
        <HeroSlider slides={slides} title={hero.headline} />
      ) : (
        <section className="relative flex h-[70svh] items-end overflow-hidden bg-forest-900">
          <Img src={photos.fortRidge} alt="" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="container-site relative pb-12">
            <h1 className="text-4xl font-extrabold text-white sm:text-6xl">{hero.headline}</h1>
          </div>
        </section>
      )}

      {/* ---------- Search + numbers ---------- */}
      <section className="border-b border-mountain-100 bg-white">
        <div className="container-site py-6 sm:py-8">
          <form action="/treks" method="get" className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="q" className="label">Where to?</label>
              <input id="q" name="q" placeholder="Rajgad, Kalsubai, Hampi…" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div>
                <label htmlFor="month" className="label">Month</label>
                <select id="month" name="month" className="input" defaultValue="">
                  <option value="">Any month</option>
                  {nextMonths(6).map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="label">Trip type</label>
                <select id="type" name="type" className="input" defaultValue="">
                  <option value="">All types</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-forest h-[50px] px-6">
              <Search size={18} /> Search
            </button>
          </form>
          <dl className="mt-6 grid grid-cols-2 gap-y-4 border-t border-mountain-100 pt-6 sm:grid-cols-4 sm:divide-x sm:divide-mountain-100">
            {site.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse sm:items-center sm:text-center">
                <dt className="text-[13px] text-mountain-500">{s.label}</dt>
                <dd className="text-2xl font-extrabold tracking-tight text-forest-900 sm:text-3xl">
                  {s.decimals ? s.value.toFixed(s.decimals) : s.value.toLocaleString("en-IN")}
                  <span className="text-sunset-500">{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Pick a weekend ---------- */}
      <section className="container-site mt-16 sm:mt-20">
        <Reveal>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Pick a weekend</h2>
              <p className="mt-1 text-mountain-500">Every trip leaving in the next two months, with live seat counts.</p>
            </div>
            <Link href="/treks" className="font-semibold text-forest-700 hover:text-forest-900">Browse all trips</Link>
          </div>
          <WeekendPlanner weekends={weekends} />
        </Reveal>
      </section>

      {/* ---------- Trips by type ---------- */}
      <section className="container-site mt-20">
        <Reveal>
          <h2 className="section-title">Find your kind of trip</h2>
          <p className="mb-6 mt-1 text-mountain-500">Fort treks and night climbs, lakeside camps, backpacking and the Himalayas.</p>
          <TripCollections tabs={tabs} />
        </Reveal>
      </section>

      {/* ---------- A day on the trail ---------- */}
      {dayTrip && timeline && (
        <section className="mt-20 bg-mist py-16 sm:py-20">
          <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-24">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-forest-800 lg:aspect-[4/5]">
                <Img src={dayTrip.images[0]} alt={dayTrip.name} sizes="(max-width: 1024px) 100vw, 45vw" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                  <p className="text-sm font-semibold text-white/80">{dayTrip.location}</p>
                  <p className="text-2xl font-extrabold text-white">{dayTrip.name}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="section-title">A {dayTrip.name.split(" ")[0]} Sunday, start to finish</h2>
              <p className="mt-2 text-lg text-mountain-600">What a one-day trek with us actually looks like, from pickup to drop.</p>
              <ol className="mt-8 border-l-2 border-mountain-200">
                {timeline.map((s, i) => (
                  <li key={i} className="relative pb-6 pl-6 last:pb-0">
                    <span className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-mist ${i === 0 || i === timeline.length - 1 ? "bg-sunset-500" : "bg-forest-700"}`} />
                    {s.time && <p className="text-sm font-bold text-forest-700">{s.time}</p>}
                    <p className="text-[17px] text-mountain-800">{s.text}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-[1.25rem] bg-white p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-mountain-200 pb-4">
                  <p className="font-bold">Everything in the price</p>
                  <p className="text-2xl font-extrabold text-forest-900">{inr(punePrice(dayTrip))}</p>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {dayTrip.inclusions.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] text-mountain-700">
                      <Check size={18} className="mt-0.5 shrink-0 text-forest-600" /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href={`/book/${dayTrip.slug}${dayNext ? `?batch=${dayNext.id}` : ""}`} className="btn-cta">
                    Book {dayTrip.name.split(" ")[0]}
                    <span className="btn-cta-icon"><ArrowRight size={18} /></span>
                  </Link>
                  <Link href={`/treks/${dayTrip.slug}`} className="text-sm font-semibold text-forest-700 hover:text-forest-900">See full trip details</Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Why people book with us ---------- */}
      <section className="container-site mt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <h2 className="section-title">Why people book with us</h2>
            <ul className="mt-8 space-y-6">
              {whyUs.map((w) => {
                const Icon = whyIcons[w.icon];
                return (
                  <li key={w.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="font-bold">{w.title}</h3>
                      <p className="mt-0.5 text-[15px] leading-relaxed text-mountain-600">{w.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal className="order-1 grid grid-cols-5 gap-3 lg:order-2" delay={100}>
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-forest-800">
              <Img src={photos.snowGroup} alt="Trekkers on a snowy Himalayan slope" sizes="(max-width: 1024px) 60vw, 30vw" />
            </div>
            <div className="col-span-2 grid gap-3">
              <div className="relative overflow-hidden rounded-[1.25rem] bg-forest-800">
                <Img src={photos.tentsForest} alt="Tents lit up at a campsite" sizes="(max-width: 1024px) 40vw, 20vw" />
              </div>
              <div className="relative overflow-hidden rounded-[1.25rem] bg-forest-800">
                <Img src={photos.waterfall} alt="A waterfall in a green valley" sizes="(max-width: 1024px) 40vw, 20vw" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Solo travellers ---------- */}
      <section className="container-site mt-20">
        <Reveal className="overflow-hidden rounded-[1.5rem] bg-forest-900">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[18rem] lg:min-h-full">
              <Img src={photos.groupOnHill} alt="A group of trekkers on a green hilltop" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="p-6 sm:p-10">
              <h2 className="section-title text-white">Coming alone? Most people do.</h2>
              <p className="mt-3 text-lg leading-relaxed text-forest-100">Here&apos;s how a stranger becomes a trek buddy by breakfast.</p>
              <ol className="mt-6 space-y-4">
                {soloSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-forest-900">{i + 1}</span>
                    <div>
                      <h3 className="font-bold text-white">{s.title}</h3>
                      <p className="mt-0.5 text-[15px] leading-relaxed text-forest-200">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={site.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1fb757]">
                  <WhatsAppIcon className="h-5 w-5" /> Join our WhatsApp community
                </a>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
                  <InstagramIcon /> {site.instagramHandle}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="container-site mt-20">
        <Reveal>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="section-title">From our travellers</h2>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-forest-900">
              <Star size={16} className="text-sunset-500" fill="currentColor" />
              {site.stats.find((s) => /rating/i.test(s.label))?.value.toFixed(1)} on Google
            </p>
          </div>
          <div className="rail sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {reviews.map((r, i) => (
              <figure key={i} className="flex w-[80vw] max-w-sm shrink-0 flex-col rounded-[1.25rem] border border-mountain-100 bg-white p-5 sm:w-auto">
                <div className="flex gap-0.5 text-sunset-500" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={15} fill={k < r.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-mountain-700">{r.text}</blockquote>
                <figcaption className="mt-4 border-t border-mountain-100 pt-3 text-sm">
                  <span className="block font-bold text-forest-900">{r.name}</span>
                  <span className="block text-mountain-500">{r.trip}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Custom trips ---------- */}
      <section className="container-site mt-20">
        <Reveal className="relative overflow-hidden rounded-[1.5rem] bg-forest-900">
          <Img src={photos.snowWalkers} alt="" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/75 to-forest-900/20" />
          <div className="relative max-w-xl p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-white sm:text-4xl">Planning for your office, college or family?</h2>
            <p className="mt-3 text-forest-100">Tell us your group size, dates and budget. We&apos;ll send a plan and a quote within a day.</p>
            <Link href="/plan-a-trip" className="btn-cta-light mt-6">
              Plan a custom trip
              <span className="btn-cta-icon"><ArrowRight size={18} /></span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="container-site mt-20">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="section-title">From the trail</h2>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900">
            <InstagramIcon /> Follow {site.instagramHandle}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {instagramTiles.map((src, i) => (
            <a key={i} href={site.instagram} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-xl bg-forest-100 sm:rounded-2xl" aria-label="Open our Instagram">
              <Img src={src} alt="" sizes="(max-width: 640px) 33vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </a>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="container-site mt-20 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="section-title">Questions, answered</h2>
          <p className="mt-3 text-mountain-600">Still unsure about something?</p>
          <a href={whatsappLink("Hi! I have a question about your trips.")} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4">
            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Ask us on WhatsApp
          </a>
        </div>
        <FaqList items={homeFaqs} />
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homeFaqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
