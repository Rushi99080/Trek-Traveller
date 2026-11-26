"use client";

/**
 * HERO: the next departures, one full-screen photo at a time.
 * Photos cross-fade with a slow zoom; the tabs at the bottom show which trip
 * is on screen and fill up until the next one appears.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Clock, Mountain } from "lucide-react";
import Img from "../Img";

export interface HeroSlide {
  id: string;
  name: string;
  location: string;
  image: string;
  date: string; // "Sat, 29 Nov"
  pickup: string; // "9:30 pm from Pune"
  duration: string;
  difficulty: string;
  altitude: string;
  price: string;
  seatsLeft: number;
  href: string;
  bookHref: string;
}

const DURATION = 7000;

export default function HeroSlider({ slides, title }: { slides: HeroSlide[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const s = slides[index];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoplay(false);
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = (i + slides.length) % slides.length;
      setIndex(next);
      // keep the active tab visible on phones (scrolls the tab row only, never the page)
      const row = tabsRef.current;
      const tab = row?.children[next] as HTMLElement | undefined;
      if (row && tab && row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
      }
    },
    [slides.length],
  );

  if (!s) return null;

  return (
    <section
      className="relative h-[calc(100svh-4rem)] min-h-[37rem] max-h-[54rem] overflow-hidden bg-forest-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Upcoming departures"
    >
      {/* Photos */}
      {slides.map((sl, i) => (
        <div key={sl.id} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== index}>
          <div key={i === index ? `on-${index}` : "off"} className={`absolute inset-0 ${i === index ? "animate-kenburns" : ""}`}>
            <Img src={sl.image} alt={i === index ? `${sl.name}, ${sl.location}` : ""} priority={i === 0} sizes="100vw" />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      <div className="container-site relative flex h-full flex-col pb-5 pt-6 sm:pt-8">
        <h1 className="max-w-md text-sm font-semibold leading-snug text-white/85 sm:text-base">{title}</h1>

        {/* Trip on screen */}
        <div key={s.id} className="mt-auto max-w-3xl animate-fade-up">
          <p className="flex items-center gap-2 text-sm font-semibold text-sunset-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunset-300 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sunset-300" />
            </span>
            {index === 0 ? "Next departure" : "Coming up"} | {s.date}
          </p>
          <h2 className="mt-2 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">{s.name}</h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-white/85">
            <li className="flex items-center gap-1.5"><CalendarDays size={16} /> {s.pickup}</li>
            <li className="flex items-center gap-1.5"><Clock size={16} /> {s.duration}</li>
            <li className="flex items-center gap-1.5"><Mountain size={16} /> {s.difficulty}{s.altitude ? `, ${s.altitude}` : ""}</li>
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={s.bookHref} className="btn-cta-light">
              Book from {s.price}
              <span className="btn-cta-icon"><ArrowRight size={18} /></span>
            </Link>
            <Link href={s.href} className="btn-ghost-light">Trip details</Link>
            {s.seatsLeft > 0 && s.seatsLeft <= 10 && <span className="text-sm font-semibold text-white/80">Only {s.seatsLeft} seats left</span>}
          </div>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="-mx-4 mt-8 flex snap-x gap-2 overflow-x-auto pb-1 pl-4 pr-20 [scrollbar-width:none] sm:mx-0 sm:grid sm:px-0"
          style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
          role="tablist"
          aria-label="Choose a departure"
        >
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                go(i);
                setPaused(true);
              }}
              className={`group relative w-[42vw] shrink-0 snap-start overflow-hidden rounded-xl px-3 pb-3 pt-3.5 text-left transition-colors sm:w-auto ${
                i === index ? "bg-white/15 backdrop-blur-md" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="absolute inset-x-0 top-0 h-[3px] bg-white/20">
                {i === index && (
                  <span
                    key={`${index}-${paused}-${autoplay}`}
                    className="block h-full origin-left bg-white"
                    style={
                      autoplay && !paused
                        ? { animation: `progress ${DURATION}ms linear forwards` }
                        : { transform: "scaleX(1)" }
                    }
                    onAnimationEnd={() => go(index + 1)}
                  />
                )}
              </span>
              <span className={`block truncate text-sm font-bold ${i === index ? "text-white" : "text-white/70"}`}>{sl.name}</span>
              <span className="block text-xs text-white/60">{sl.date}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
