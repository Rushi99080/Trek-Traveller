import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Bus, Compass, ShieldPlus, Star, Users } from "lucide-react";
import { getTrips } from "@/lib/data";
import { batchDisplayStatus, nextBatch, seatsLeft, upcomingBatches } from "@/lib/format";
import { departureTime } from "@/lib/geo";
import { hero, homeFaqs, instagramTiles, reviews, soloSteps, whyUs } from "@/data/content";
import { journeyScenes } from "@/data/journey";
import { photos } from "@/data/photos";
import { site, whatsappLink } from "@/site.config";
import Img from "@/components/Img";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { InstagramIcon } from "@/components/SocialIcons";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import JourneyScroll from "@/components/home/JourneyScroll";
import DepartureBoard, { type BoardRow } from "@/components/home/DepartureBoard";
import OdometerStats from "@/components/home/OdometerStats";
import TripPhotoCard from "@/components/home/TripPhotoCard";

export const revalidate = 60;

const whyIcons = { Compass, ShieldPlus, Users, Bus, BadgeIndianRupee };
const IST = "Asia/Kolkata";
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: IST, ...o }).format(d);

/** Short board name: drop words from the end until it fits 20 characters */
function boardName(name: string) {
  const words = name.toUpperCase().split(" ");
  while (words.join(" ").length > 20 && words.length > 1) words.pop();
  return words.join(" ").slice(0, 20);
}

const packages = [
  { slug: "weekend-treks", title: "Weekend treks from Pune", text: "Sahyadri forts and trails, back by Sunday night." },
  { slug: "night-treks", title: "Night treks", text: "Climb under the stars, watch sunrise from the top." },
  { slug: "camping", title: "Lakeside camping", text: "Tents, bonfire and barbecue. No fitness needed." },
  { slug: "backpacking", title: "Backpacking trips", text: "Hampi, Gokarna and more, 3–4 days with a group." },
  { slug: "himalayan-treks", title: "Himalayan treks", text: "Your first snow summit, with a trained team." },
];

export default async function HomePage() {
  const trips = await getTrips();
  const now = Date.now();

  // ---------- Departures ----------
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
  const finalHref = firstOpen ? `/book/${firstOpen.trip.slug}?batch=${firstOpen.batch.id}` : "/treks";

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

  // Featured trips: soonest departure first, one card per trip
  const featured = [...trips]
    .sort((a, b) => (nextBatch(a)?.startDate ?? "9999").localeCompare(nextBatch(b)?.startDate ?? "9999"))
    .slice(0, 6);

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

      {/* ---------- The journey (scroll story) ---------- */}
      <JourneyScroll scenes={journeyScenes} headline={hero.headline} subheadline={hero.subheadline} finalHref={finalHref} />

      {/* ---------- Stats ---------- */}
      <section id="trips" className="container-site scroll-mt-20 py-12 sm:py-16">
        <OdometerStats stats={site.stats} />
      </section>

      {/* ---------- Featured trips ---------- */}
      <section className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Unforgettable weekends, new friendships</h2>
          <p className="mt-3 text-mountain-500">From one-day fort treks to Himalayan summits. Pick a date, choose your pickup, and you&apos;re in.</p>
        </div>
        <div className="rail mt-8 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {featured.map((t) => (
            <TripPhotoCard key={t.id} trip={t} className="w-[80vw] max-w-[22rem] shrink-0 sm:w-auto sm:max-w-none" />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/treks" className="btn-cta">
            View all trips
            <span className="btn-cta-icon"><ArrowRight size={18} /></span>
          </Link>
        </div>
      </section>

      {/* ---------- Departure board ---------- */}
      {board.length > 0 && (
        <section className="container-site mt-20">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Leaving soon</h2>
              <p className="mt-1 text-mountain-500">Live seat count. Tap a departure to book your seat.</p>
            </div>
          </div>
          <DepartureBoard rows={board} />
        </section>
      )}

      {/* ---------- Why us ---------- */}
      <section className="mt-20 bg-mist py-16">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Why travel with us?</h2>
            <p className="mt-3 text-mountain-500">Safety, good company and honest prices. That&apos;s why people come back.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {whyUs.map((w, i) => {
              const Icon = whyIcons[w.icon];
              const dark = i === 1;
              return (
                <li key={w.title} className={`flex flex-col items-center rounded-[1.25rem] p-5 text-center sm:p-6 ${dark ? "bg-forest-900 text-white" : "bg-white"} ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full ${dark ? "bg-white/10 text-sunset-300" : "bg-forest-50 text-forest-700"}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className={`mt-4 text-[15px] font-bold leading-snug sm:text-base ${dark ? "text-white" : ""}`}>{w.title}</h3>
                  <p className={`mt-1.5 text-[13px] leading-relaxed sm:text-sm ${dark ? "text-forest-200" : "text-mountain-500"}`}>{w.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Packages ---------- */}
      <section className="container-site mt-20">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-[1.5rem] bg-forest-900 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Popular trip types</h2>
              <Link href="/treks" className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                View all
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-white/10">
              {packages.map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/treks?type=${p.slug}`} className="group flex items-center gap-4 py-4">
                    <span className="w-7 shrink-0 text-sm font-semibold text-white/45">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-white">{p.title}</span>
                      <span className="block text-sm text-forest-200">{p.text}</span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-colors group-hover:bg-white group-hover:text-forest-900">
                      <ArrowRight size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex min-h-[22rem] items-end overflow-hidden rounded-[1.5rem] bg-forest-800 p-5 sm:p-6">
            <Img src={photos.sunriseSummit} alt="A trekker on a summit at sunrise" sizes="(max-width: 1024px) 100vw, 40vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
              <p className="text-xl font-bold leading-snug text-forest-900">Your weekend is waiting. Are you ready?</p>
              <Link href="/treks" className="btn-cta mt-4">
                Explore now
                <span className="btn-cta-icon"><ArrowRight size={18} /></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="container-site mt-20">
        <h2 className="section-title text-center">What our travellers say</h2>
        <div className="rail mt-8 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <figure key={i} className="flex w-[80vw] max-w-sm shrink-0 flex-col rounded-[1.25rem] border border-mountain-100 bg-white p-5 sm:w-auto">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-100 font-bold text-forest-800">{r.name.replace(/[^A-Za-z]/g, "").charAt(0) || "T"}</span>
                <figcaption className="text-sm">
                  <span className="block font-bold text-forest-900">{r.name}</span>
                  <span className="block text-mountain-500">{r.trip}</span>
                </figcaption>
              </div>
              <div className="mt-4 flex gap-0.5 text-sunset-500" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={15} fill={k < r.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-mountain-700">{r.text}</blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Solo travellers ---------- */}
      <section className="container-site mt-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-forest-800 lg:aspect-[5/4]">
            <Img src={photos.groupOnHill} alt="A group of trekkers on a green hilltop" sizes="(max-width: 1024px) 100vw, 50vw" />
            <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-forest-900 shadow-lg">Most of our travellers join solo</span>
          </div>
          <div>
            <h2 className="section-title">Travelling solo? You won&apos;t be for long.</h2>
            <p className="mt-3 text-lg leading-relaxed text-mountain-600">Here&apos;s how a stranger becomes a trek buddy by breakfast.</p>
            <ol className="mt-6 space-y-3">
              {soloSteps.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-mist p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-mountain-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={site.whatsappCommunity} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1fb757]">
                <WhatsAppIcon className="h-5 w-5" /> Join our WhatsApp community
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <InstagramIcon /> {site.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Custom trips ---------- */}
      <section className="container-site mt-20">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-forest-900">
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
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="container-site mt-20">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="section-title">From the trail</h2>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900">
            <InstagramIcon /> Follow {site.instagramHandle}
          </a>
        </div>
        <div className="rail sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0">
          {instagramTiles.map((src, i) => (
            <a key={i} href={site.instagram} target="_blank" rel="noopener noreferrer" className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-2xl sm:w-auto" aria-label="Open our Instagram">
              <Img src={src} alt="" sizes="(max-width: 640px) 160px, 16vw" className="object-cover transition-transform duration-500 hover:scale-105" />
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
