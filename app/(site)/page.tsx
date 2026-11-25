import Link from "next/link";
import { BadgeIndianRupee, Bus, Compass, Search, ShieldPlus, Star, Users } from "lucide-react";
import { getTrips } from "@/lib/data";
import { batchDisplayStatus, dateRange, fromPrice, inr, monthKey, monthLabel, nextBatch, seatsLeft, toISODate, upcomingBatches } from "@/lib/format";
import { compass, departureTime, fromPune } from "@/lib/geo";
import { categories, hero, homeFaqs, instagramTiles, reviews, soloSteps, whyUs } from "@/data/content";
import { site, whatsappLink } from "@/site.config";
import Img from "@/components/Img";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { InstagramIcon } from "@/components/SocialIcons";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import LiveHero, { type NextDeparture } from "@/components/home/LiveHero";
import DepartureBoard, { type BoardRow } from "@/components/home/DepartureBoard";
import TripRadar, { type RadarPoint } from "@/components/home/TripRadar";
import SoloToCrew from "@/components/home/SoloToCrew";
import OdometerStats from "@/components/home/OdometerStats";

export const revalidate = 60;

const whyIcons = { Compass, ShieldPlus, Users, Bus, BadgeIndianRupee };

function nextMonths(n: number) {
  const d = new Date();
  return Array.from({ length: n }, (_, i) => {
    const key = monthKey(toISODate(new Date(d.getFullYear(), d.getMonth() + i, 1)));
    return { key, label: monthLabel(key) };
  });
}

const IST = "Asia/Kolkata";
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: IST, ...o }).format(d);

/** Short board name: drop words from the end until it fits 20 characters */
function boardName(name: string) {
  const words = name.toUpperCase().split(" ");
  while (words.join(" ").length > 20 && words.length > 1) words.pop();
  return words.join(" ").slice(0, 20);
}

export default async function HomePage() {
  const trips = await getTrips();
  const now = Date.now();

  // ---------- Departures (for the hero countdown and the board) ----------
  const departures = trips
    .flatMap((t) =>
      upcomingBatches(t).map((b) => {
        const pickup = t.meetingPoints.find((m) => m.city === "Pune") ?? t.meetingPoints[0];
        return { trip: t, batch: b, at: departureTime(b.startDate, pickup?.time), status: batchDisplayStatus(b) };
      }),
    )
    .filter((d) => d.status !== "Sold Out" && d.at.getTime() > now)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const firstOpen = departures.find((d) => d.status !== "Waitlist");
  const next: NextDeparture | null = firstOpen
    ? { tripName: firstOpen.trip.name, href: `/book/${firstOpen.trip.slug}?batch=${firstOpen.batch.id}`, departAt: firstOpen.at.toISOString(), seatsLeft: seatsLeft(firstOpen.batch) }
    : null;

  const board: BoardRow[] = departures.slice(0, 6).map((d) => ({
    id: d.batch.id,
    date: fmt(d.at, { weekday: "short", day: "2-digit", month: "short" }).replace(",", "").toUpperCase(),
    time: fmt(d.at, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    destination: boardName(d.trip.name),
    fullName: d.trip.name,
    seats: seatsLeft(d.batch),
    status: d.status as BoardRow["status"],
    href: `/book/${d.trip.slug}?batch=${d.batch.id}`,
  }));

  // ---------- Radar ----------
  const radar: RadarPoint[] = trips
    .filter((t) => t.latitude != null && t.longitude != null)
    .map((t) => {
      const { km, bearing } = fromPune(t.latitude!, t.longitude!);
      const nb = nextBatch(t);
      return {
        id: t.id,
        name: t.name,
        km,
        bearing,
        direction: compass(bearing),
        difficulty: t.difficulty,
        durationLabel: t.durationLabel,
        image: t.images[0] ?? "",
        next: nb ? `Next: ${dateRange(nb.startDate, nb.endDate)}` : "New dates coming soon",
        price: inr(fromPrice(t)),
        href: `/treks/${t.slug}`,
        bookHref: nb ? `/book/${t.slug}?batch=${nb.id}` : `/treks/${t.slug}`,
      };
    });

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

      {/* ---------- Live hero ---------- */}
      <section className="relative">
        <LiveHero headline={hero.headline} subheadline={hero.subheadline} next={next} />
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

      {/* ---------- Departure board ---------- */}
      {board.length > 0 && (
        <section className="container-site mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Leaving soon</h2>
              <p className="mt-1 text-mountain-500">Live seat count. Tap a departure to book your seat.</p>
            </div>
            <Link href="/treks" className="hidden shrink-0 font-semibold text-forest-700 hover:text-forest-900 sm:block">
              See all trips
            </Link>
          </div>
          <DepartureBoard rows={board} />
        </section>
      )}

      {/* ---------- Radar ---------- */}
      {radar.length > 0 && (
        <section className="container-site mt-20">
          <h2 className="section-title">How far is your weekend?</h2>
          <p className="mb-6 mt-1 max-w-xl text-mountain-500">Every trip plotted from Pune at its real distance and direction. Tap a dot to see the trip.</p>
          <TripRadar points={radar} />
        </section>
      )}

      {/* ---------- Categories ---------- */}
      <section className="container-site mt-20">
        <h2 className="section-title">Pick your kind of adventure</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={c.slug === "corporate-trips" ? "/plan-a-trip?type=Corporate" : `/treks?type=${c.slug}`}
              className={`group relative flex aspect-[4/3] items-end overflow-hidden rounded-card bg-forest-800 p-4 ${i === 0 ? "col-span-2 aspect-[2/1] lg:col-span-1 lg:aspect-[4/3]" : ""}`}
            >
              <Img src={c.image} alt="" sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
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
            <OdometerStats stats={site.stats} />
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

      {/* ---------- Solo → crew ---------- */}
      <section className="container-site mt-16">
        <div className="overflow-hidden rounded-[1.75rem] bg-[#0B1626] p-5 sm:p-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title text-white">Travelling solo? You won&apos;t be for long.</h2>
              <p className="mt-2 max-w-xl text-lg leading-relaxed text-forest-100/80">Most people on our trips come alone. Scroll and watch how that changes.</p>
            </div>
          </div>
          <SoloToCrew steps={soloSteps} />
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1fb757]">
              <WhatsAppIcon className="h-5 w-5" /> Join our WhatsApp community
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
              <InstagramIcon /> {site.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Custom trips ---------- */}
      <section className="container-site mt-16">
        <div className="flex flex-col gap-5 rounded-card border border-mountain-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Planning for your office, college or family?</h2>
            <p className="mt-2 max-w-xl text-mountain-600">Tell us your group size, dates and budget. We&apos;ll send a plan and a quote within a day.</p>
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
