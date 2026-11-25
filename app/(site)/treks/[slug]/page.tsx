import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Gauge,
  MapPin,
  Mountain,
  Printer,
  Route,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { getLeaders, getTripBySlug, getTrips } from "@/lib/data";
import {
  batchDisplayStatus,
  dateRange,
  fromPrice,
  inr,
  nextBatch,
  seatsLeft,
  upcomingBatches,
} from "@/lib/format";
import { cancellationPolicy, categoryLabel } from "@/data/content";
import { site, whatsappLink } from "@/site.config";
import Gallery from "@/components/Gallery";
import { DifficultyBadge, StatusBadge } from "@/components/Badges";
import CarryChecklist from "@/components/CarryChecklist";
import FaqList from "@/components/FaqList";
import TripCard from "@/components/TripCard";
import JsonLd from "@/components/JsonLd";
import TrackView from "@/components/TrackView";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return { title: "Trip not found" };
  const next = nextBatch(trip);
  const title = `${trip.name} from Pune & Mumbai — ${trip.durationLabel}, from ${inr(fromPrice(trip))}`;
  const description = `${trip.shortDescription} ${next ? `Next batch: ${dateRange(next.startDate, next.endDate)}.` : ""} ${trip.difficulty} difficulty.`.trim();
  return {
    title,
    description,
    alternates: { canonical: `/treks/${trip.slug}` },
    openGraph: { title: trip.name, description, url: `/treks/${trip.slug}`, type: "website" },
  };
}

const sections = [
  { id: "dates", label: "Dates" },
  { id: "prices", label: "Prices" },
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "carry", label: "Things to carry" },
  { id: "pickup", label: "Pickup" },
  { id: "policy", label: "Cancellation" },
  { id: "faqs", label: "FAQs" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-32 text-2xl font-bold sm:text-[1.75rem]">
      {children}
    </h2>
  );
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  const [allTrips, leaders] = await Promise.all([getTrips(), getLeaders()]);
  const batches = upcomingBatches(trip);
  const next = nextBatch(trip);
  const price = fromPrice(trip);
  const leaderIds = next?.leaderIds?.length ? next.leaderIds : trip.leaderIds;
  const tripLeaders = leaders.filter((l) => leaderIds.includes(l.id));
  const similar = allTrips
    .filter((t) => t.id !== trip.id && t.categories.some((c) => trip.categories.includes(c)))
    .concat(allTrips.filter((t) => t.id !== trip.id))
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
    .slice(0, 3);
  const bookHref = next ? `/book/${trip.slug}?batch=${next.id}` : `/book/${trip.slug}`;
  const nextStatus = next ? batchDisplayStatus(next) : null;

  const facts = [
    { icon: Clock, label: "Duration", value: trip.durationLabel },
    { icon: Gauge, label: "Difficulty", value: trip.difficulty },
    { icon: Mountain, label: "Altitude", value: trip.altitude },
    { icon: Route, label: "Distance", value: trip.distance },
    { icon: Sun, label: "Best season", value: trip.bestSeason },
    { icon: MapPin, label: "Region", value: trip.region },
  ].filter((f) => f.value);

  return (
    <>
      <TrackView name={trip.name} id={trip.slug} value={price} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: trip.name,
            description: trip.shortDescription,
            url: `${site.url}/treks/${trip.slug}`,
            image: trip.images.map((i) => (i.startsWith("http") ? i : `${site.url}${i}`)),
            touristType: trip.categories.map(categoryLabel),
            itinerary: {
              "@type": "ItemList",
              itemListElement: trip.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `${d.label}: ${d.title}` })),
            },
            provider: { "@type": "TravelAgency", name: site.name, url: site.url },
            offers: batches.map((b) => ({
              "@type": "Offer",
              price: price,
              priceCurrency: "INR",
              availability: seatsLeft(b) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              validFrom: new Date().toISOString().slice(0, 10),
              url: `${site.url}/book/${trip.slug}?batch=${b.id}`,
              availabilityStarts: b.startDate,
              availabilityEnds: b.endDate,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "Trips", item: `${site.url}/treks` },
              { "@type": "ListItem", position: 3, name: trip.name, item: `${site.url}/treks/${trip.slug}` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: trip.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <div className="container-site pt-4 sm:pt-8">
        <nav className="mb-4 hidden text-sm text-mountain-500 md:block" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-forest-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/treks" className="hover:text-forest-700">Trips</Link>
          <span className="mx-2">/</span>
          <span className="text-mountain-700">{trip.name}</span>
        </nav>

        <Gallery images={trip.images} name={trip.name} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={trip.difficulty} />
              {trip.categories.slice(0, 2).map((c) => (
                <Link key={c} href={`/treks?type=${c}`} className="rounded-full bg-mountain-100 px-2.5 py-1 text-xs font-semibold text-mountain-600 hover:bg-mountain-200">
                  {categoryLabel(c)}
                </Link>
              ))}
            </div>
            <h1 className="mt-3 text-[2.25rem] font-extrabold leading-[1.05] sm:text-5xl">{trip.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-mountain-600">
              <MapPin size={17} /> {trip.location}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-mountain-700">{trip.shortDescription}</p>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-mountain-100 bg-mountain-100 sm:grid-cols-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white p-4">
                  <dt className="flex items-center gap-1.5 text-[13px] text-mountain-500">
                    <Icon size={15} /> {label}
                  </dt>
                  <dd className="mt-1 font-semibold leading-snug text-forest-900">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Section jump links */}
            <nav className="sticky top-16 z-30 -mx-4 mt-8 border-b border-mountain-100 bg-mist/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" aria-label="On this page">
              <div className="flex gap-5 overflow-x-auto py-3 text-sm font-semibold text-mountain-500 [scrollbar-width:none]">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="shrink-0 hover:text-forest-700">
                    {s.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Dates */}
            <section className="mt-8">
              <H2 id="dates">Dates & availability</H2>
              {batches.length ? (
                <ul className="mt-4 grid gap-3">
                  {batches.map((b) => {
                    const st = batchDisplayStatus(b);
                    const left = seatsLeft(b);
                    const disabled = st === "Sold Out";
                    return (
                      <li key={b.id} className="card flex items-center justify-between gap-3 p-4">
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-forest-900">
                            <CalendarDays size={17} className="text-mountain-400" />
                            {dateRange(b.startDate, b.endDate)}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-mountain-500">
                            <StatusBadge status={st} />
                            {st === "Open" || st === "Filling Fast" ? `${left} of ${b.totalSeats} seats left` : st === "Waitlist" ? "Batch full" : ""}
                          </p>
                        </div>
                        {disabled ? (
                          <span className="text-sm font-semibold text-mountain-400">Sold out</span>
                        ) : (
                          <Link href={`/book/${trip.slug}?batch=${b.id}`} className={st === "Waitlist" ? "btn-outline px-4 py-2 text-sm" : "btn-primary px-4 py-2 text-sm"}>
                            {st === "Waitlist" ? "Join waitlist" : "Book"}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="card mt-4 p-5">
                  <p className="text-mountain-700">New dates for this trip are coming soon.</p>
                  <a href={whatsappLink(`Hi! Please tell me when the next ${trip.name} is planned.`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3">
                    <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Get notified on WhatsApp
                  </a>
                </div>
              )}
            </section>

            {/* Prices */}
            <section className="mt-12">
              <H2 id="prices">Price per person</H2>
              <div className="card mt-4 divide-y divide-mountain-100">
                {trip.pickupPrices.map((p) => {
                  const mp = trip.meetingPoints.find((m) => m.city === p.pickup);
                  return (
                    <div key={p.pickup} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="font-semibold text-forest-900">From {p.pickup}</p>
                        {mp && <p className="text-sm text-mountain-500">{mp.place}</p>}
                      </div>
                      <p className="font-display text-xl font-bold text-forest-800">{inr(p.price)}</p>
                    </div>
                  );
                })}
              </div>
              {trip.stayOptions.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-display text-lg font-semibold">Stay options</h3>
                  <ul className="mt-2 space-y-1.5 text-[15px] text-mountain-700">
                    {trip.stayOptions.map((s) => (
                      <li key={s.name} className="flex justify-between gap-4 border-b border-dashed border-mountain-200 pb-1.5">
                        <span>{s.name}</span>
                        <span className="font-semibold">{s.extra ? `+ ${inr(s.extra)}` : "Included"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="mt-4 space-y-1.5 text-[15px] text-mountain-600">
                {trip.groupDiscount && (
                  <li>
                    Groups of {trip.groupDiscount.minPeople} or more get <strong className="text-forest-800">{trip.groupDiscount.percent}% off</strong> automatically.
                  </li>
                )}
                {trip.paymentMode === "advance" && trip.advanceAmount > 0 && (
                  <li>Reserve your seat with {inr(trip.advanceAmount)} per person and pay the rest before departure.</li>
                )}
                <li>{site.pricesIncludeGst ? "Prices include GST." : `GST of ${site.gstRate}% is added at checkout.`}</li>
              </ul>
            </section>

            {/* Overview */}
            <section className="mt-12">
              <H2 id="overview">Overview</H2>
              <div className="prose-trip mt-4">
                {trip.overview.split(/\n\s*\n/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {trip.highlights.length > 0 && (
                <>
                  <h3 className="mt-6 font-display text-lg font-semibold">Highlights</h3>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {trip.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5 text-[15px] text-mountain-700">
                        <Check size={18} className="mt-0.5 shrink-0 text-forest-500" /> {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Itinerary */}
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <H2 id="itinerary">Day-wise itinerary</H2>
                <Link href={`/treks/${trip.slug}/itinerary`} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900">
                  <Printer size={16} /> Save as PDF
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {trip.itinerary.map((d, i) => (
                  <details key={i} open={i === 0} className="card group overflow-hidden">
                    <summary className="flex items-center gap-4 p-4">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-forest-50 text-center font-display text-xs font-bold leading-tight text-forest-700">
                        {d.label}
                      </span>
                      <span className="flex-1 font-semibold text-forest-900">{d.title}</span>
                      <ChevronDown size={20} className="shrink-0 text-mountain-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="space-y-2 border-t border-mountain-100 px-4 py-4 pl-20 text-[15px] text-mountain-700">
                      {d.points.map((p, k) => (
                        <li key={k} className="relative before:absolute before:-left-4 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-sunset-400">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>

            {/* Inclusions */}
            <section className="mt-12">
              <H2 id="inclusions">What&apos;s included</H2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <h3 className="font-display text-lg font-semibold text-forest-700">Included</h3>
                  <ul className="mt-3 space-y-2.5">
                    {trip.inclusions.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px] text-mountain-700">
                        <Check size={18} className="mt-0.5 shrink-0 text-forest-500" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <h3 className="font-display text-lg font-semibold text-mountain-600">Not included</h3>
                  <ul className="mt-3 space-y-2.5">
                    {trip.exclusions.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px] text-mountain-600">
                        <X size={18} className="mt-0.5 shrink-0 text-mountain-400" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Things to carry */}
            <section className="mt-12">
              <H2 id="carry">Things to carry</H2>
              <p className="mt-1 text-sm text-mountain-500">Tap items to tick them off while you pack.</p>
              <div className="mt-4">
                <CarryChecklist items={trip.thingsToCarry} />
              </div>
              {trip.fitness && (
                <div className="mt-5 rounded-card bg-sunset-50 p-5 ring-1 ring-sunset-100">
                  <h3 className="font-display text-lg font-semibold">Fitness needed</h3>
                  <p className="mt-1.5 leading-relaxed text-mountain-700">{trip.fitness}</p>
                </div>
              )}
            </section>

            {/* Pickup */}
            <section className="mt-12">
              <H2 id="pickup">Meeting points & pickup times</H2>
              <ul className="mt-4 grid gap-3">
                {trip.meetingPoints.map((m) => (
                  <li key={m.city + m.place} className="card flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="font-semibold text-forest-900">{m.city}</p>
                      <p className="text-[15px] text-mountain-600">{m.place}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-sunset-700">
                        <Clock size={14} /> {m.time}
                      </p>
                    </div>
                    {m.mapsUrl && (
                      <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900">
                        Map <ExternalLink size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Leaders */}
            {tripLeaders.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold sm:text-[1.75rem]">Your trek leaders</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tripLeaders.map((l) => (
                    <li key={l.id} className="card flex gap-4 p-4">
                      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-forest-600">
                        {l.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={l.photo} alt={l.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <UserRound size={30} />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-forest-900">{l.name}</p>
                        {l.experience && <p className="text-sm font-medium text-sunset-700">{l.experience}</p>}
                        {l.bio && <p className="mt-1 text-sm leading-relaxed text-mountain-600">{l.bio}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Policy */}
            <section className="mt-12">
              <H2 id="policy">Cancellation & refund</H2>
              <ul className="mt-4 space-y-2.5">
                {cancellationPolicy.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-mountain-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mountain-400" /> {p}
                  </li>
                ))}
              </ul>
              <Link href="/policies/cancellation-refund" className="mt-3 inline-block text-sm font-semibold text-forest-700 hover:text-forest-900">
                Read the full policy
              </Link>
            </section>

            {/* FAQs */}
            {trip.faqs.length > 0 && (
              <section className="mt-12">
                <H2 id="faqs">Frequently asked questions</H2>
                <div className="mt-4">
                  <FaqList items={trip.faqs} />
                </div>
              </section>
            )}
          </div>

          {/* ---------- Sidebar booking card (desktop) ---------- */}
          <aside className="hidden lg:block">
            <div className="card sticky top-24 p-5 shadow-lg shadow-forest-900/5">
              <p className="text-sm text-mountain-500">From</p>
              <p className="font-display text-3xl font-bold text-forest-800">
                {inr(price)} <span className="text-base font-medium text-mountain-500">/ person</span>
              </p>
              {next && (
                <p className="mt-3 flex items-center gap-2 text-[15px] text-mountain-700">
                  <CalendarDays size={17} /> Next: <strong>{dateRange(next.startDate, next.endDate)}</strong>
                </p>
              )}
              {next && nextStatus && nextStatus !== "Open" && (
                <p className="mt-2">
                  <StatusBadge status={nextStatus} /> <span className="text-sm text-mountain-500">{nextStatus === "Filling Fast" ? `${seatsLeft(next)} seats left` : ""}</span>
                </p>
              )}
              <Link href={bookHref} className="btn-primary mt-5 w-full">
                {nextStatus === "Waitlist" ? "Join waitlist" : "Book now"}
              </Link>
              <a href={whatsappLink(`Hi! I have a question about ${trip.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 w-full">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Ask on WhatsApp
              </a>
              <p className="mt-4 text-center text-xs text-mountain-500">Secure payment by UPI, card or net banking</p>
            </div>
          </aside>
        </div>

        {/* Similar trips */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title">You might also like</h2>
            <div className="rail mt-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {similar.map((t) => (
                <div key={t.id} className="w-[78vw] max-w-[300px] shrink-0 sm:w-auto sm:max-w-none">
                  <TripCard trip={t} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------- Sticky booking bar (mobile) ---------- */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-mountain-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-site items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="font-display text-xl font-bold text-forest-800">
              {inr(price)} <span className="text-xs font-medium text-mountain-500">/ person</span>
            </p>
            <p className="text-xs text-mountain-500">{next ? `Next: ${dateRange(next.startDate, next.endDate)}` : "New dates soon"}</p>
          </div>
          <Link href={bookHref} className="btn-primary px-7">
            {nextStatus === "Waitlist" ? "Join waitlist" : "Book now"}
          </Link>
        </div>
      </div>
    </>
  );
}
