import Link from "next/link";
import { BadgeIndianRupee, Bus, Compass, Search, ShieldPlus, Star, Users } from "lucide-react";

const whyIcons = { Compass, ShieldPlus, Users, Bus, BadgeIndianRupee };
import { getTrips } from "@/lib/data";
import { monthKey, monthLabel, seatsLeft, todayISO, toISODate, upcomingBatches } from "@/lib/format";
import { categories, hero, homeFaqs, instagramTiles, reviews, soloSteps, whyUs } from "@/data/content";
import { site, whatsappLink } from "@/site.config";
import TripCard from "@/components/TripCard";
import Img from "@/components/Img";
import StatsCounter from "@/components/StatsCounter";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { InstagramIcon } from "@/components/SocialIcons";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export const revalidate = 60;

function nextMonths(n: number) {
  const d = new Date();
  d.setDate(1);
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(d.getFullYear(), d.getMonth() + i, 1);
    const key = monthKey(toISODate(x));
    return { key, label: monthLabel(key) };
  });
}

export default async function HomePage() {
  const trips = await getTrips();

  // Trips leaving in the next 7 days; if none, the next few departures
  const today = todayISO();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const limit = toISODate(weekEnd);
  const departures = trips
    .flatMap((t) => upcomingBatches(t).map((b) => ({ trip: t, batch: b })))
    .sort((a, b) => a.batch.startDate.localeCompare(b.batch.startDate));
  const thisWeek = departures.filter((d) => d.batch.startDate >= today && d.batch.startDate <= limit);
  // Only dates people can still book; fall back to the next departures if this weekend is full
  const open = (d: (typeof departures)[number]) => seatsLeft(d.batch) > 0 && d.batch.status !== "waitlist" && d.batch.status !== "sold_out";
  const thisWeekOpen = thisWeek.filter(open);
  const railItems = (thisWeekOpen.length >= 2 ? thisWeekOpen : departures.filter(open)).filter(
    (d, i, arr) => arr.findIndex((x) => x.trip.id === d.trip.id) === i,
  );
  const railTrips = railItems.slice(0, 8).map((d) => d.trip);

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

      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div className="relative min-h-[31rem] overflow-hidden bg-forest-900 sm:min-h-[38rem] lg:min-h-[42rem]">
          <Img src="/images/trips/hero.svg" alt="Sahyadri ridges at sunrise with a fort on the skyline" priority sizes="100vw" className="object-cover object-[30%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/30 to-transparent" />
          <div className="container-site relative flex min-h-[31rem] flex-col justify-end pb-24 pt-20 sm:min-h-[38rem] lg:min-h-[42rem] lg:pb-36">
            <h1 className="max-w-3xl text-[2.4rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">{hero.headline}</h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-forest-50/90 sm:text-lg">{hero.subheadline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/treks" className="btn-primary px-6">
                Explore trips
              </Link>
              <Link href="/plan-a-trip" className="btn-ghost-light px-6">
                Plan a custom trip
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="container-site relative -mt-20 lg:-mt-24">
          <form action="/treks" method="get" className="card grid gap-3 p-4 shadow-xl shadow-forest-900/10 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end sm:p-5">
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
              <Search size={18} /> Search trips
            </button>
          </form>
        </div>
      </section>

      {/* ---------- This weekend ---------- */}
      <section className="container-site mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{thisWeekOpen.length >= 2 ? "Leaving this weekend" : "Coming up next"}</h2>
            <p className="mt-1 text-mountain-500">Seats are limited. Book in under 2 minutes.</p>
          </div>
          <Link href="/treks" className="hidden shrink-0 font-semibold text-forest-700 hover:text-forest-900 sm:block">
            See all trips
          </Link>
        </div>
        <div className="rail">
          {railTrips.map((t) => (
            <TripCard key={t.id} trip={t} compact />
          ))}
        </div>
        <Link href="/treks" className="btn-outline mt-4 w-full sm:hidden">
          See all trips
        </Link>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="container-site mt-16">
        <h2 className="section-title">Pick your kind of adventure</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={c.slug === "corporate-trips" ? "/plan-a-trip?type=Corporate" : `/treks?type=${c.slug}`}
              className={`group relative flex aspect-[4/3] items-end overflow-hidden rounded-card bg-forest-800 p-4 ${i === 0 ? "col-span-2 aspect-[2/1] lg:col-span-1 lg:aspect-[4/3]" : ""}`}
            >
              <Img src={c.image} alt="" sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative">
                <h3 className="text-lg font-bold leading-tight text-white sm:text-xl">{c.label}</h3>
                <p className="mt-0.5 text-[13px] text-white/80 sm:text-sm">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Why us + stats ---------- */}
      <section className="mt-20 bg-forest-800 py-16 text-white">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="section-title text-white">Why travel with us</h2>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-forest-100">
                You bring the energy. We handle the route, the transport, the food and the safety, so all you do is walk and enjoy.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2">
              {whyUs.map((w) => {
                const Icon = whyIcons[w.icon];
                return (
                  <li key={w.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sunset-300">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">{w.title}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-forest-200">{w.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-14 border-t border-white/15 pt-10">
            <StatsCounter stats={site.stats} />
          </div>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="container-site mt-16">
        <h2 className="section-title">What travellers say</h2>
        <div className="rail mt-6">
          {reviews.map((r, i) => (
            <figure key={i} className="card flex w-[82vw] max-w-sm shrink-0 flex-col p-5">
              <div className="flex gap-0.5 text-sunset-500" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={16} fill={k < r.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 leading-relaxed text-mountain-700">{r.text}</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-forest-900">{r.name}</span>
                <span className="block text-mountain-500">{r.trip}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Solo travellers + community ---------- */}
      <section className="container-site mt-16">
        <div className="overflow-hidden rounded-[1.75rem] bg-sunset-50 ring-1 ring-sunset-100">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <h2 className="section-title">Travelling solo? You won&apos;t be for long.</h2>
              <p className="mt-3 text-lg leading-relaxed text-mountain-700">
                Most people on our trips come alone. Here&apos;s how you go from stranger to trek buddy.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={site.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1fb757]">
                  <WhatsAppIcon className="h-5 w-5" /> Join our WhatsApp community
                </a>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <InstagramIcon /> {site.instagramHandle}
                </a>
              </div>
            </div>
            <ol className="grid gap-4">
              {soloSteps.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-sunset-100">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunset-500 font-display font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-mountain-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Custom trips ---------- */}
      <section className="container-site mt-16">
        <div className="flex flex-col gap-5 rounded-card border border-mountain-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Planning for your office, college or family?</h2>
            <p className="mt-2 max-w-xl text-mountain-600">
              Tell us your group size, dates and budget. We&apos;ll send a plan and a quote within a day.
            </p>
          </div>
          <Link href="/plan-a-trip" className="btn-forest shrink-0 px-6">
            Plan a custom trip
          </Link>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="container-site mt-16">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="section-title">From the trail</h2>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900">
            <InstagramIcon /> Follow {site.instagramHandle}
          </a>
        </div>
        <div className="rail">
          {instagramTiles.map((src, i) => (
            <a key={i} href={site.instagram} target="_blank" rel="noopener noreferrer" className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-2xl sm:w-48" aria-label="Open our Instagram">
              <Img src={src} alt="" sizes="200px" />
            </a>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="container-site mt-16 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
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
