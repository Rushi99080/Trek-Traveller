"use client";

/**
 * JOURNEY SCROLL
 * Full-screen scenes that play as you scroll: Pack → Ride → Arrive → Climb → Summit.
 * Each scene's video is "scrubbed" by the scroll position (it moves forward as
 * you scroll down and backward as you scroll up). Without a video, the photo
 * slowly zooms instead.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import Img from "../Img";
import type { JourneyScene } from "@/data/journey";

const FADE = 0.14; // portion of a scene used for the cross-fade into it
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function JourneyScroll({
  scenes,
  headline,
  subheadline,
  finalHref,
}: {
  scenes: JourneyScene[];
  headline: string;
  subheadline: string;
  finalHref: string;
}) {
  const n = scenes.length;
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastActive = -1;
    const primed = new Set<number>();

    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const stage = window.innerHeight - 64;
      const travel = Math.max(1, rect.height - stage);
      const p = clamp(-rect.top / travel);
      const total = p * n;
      const idx = Math.min(n - 1, Math.floor(total));

      for (let i = 0; i < n; i++) {
        const local = clamp(total - i);
        const layer = layerRefs.current[i];
        if (layer) {
          const vis = i === 0 ? 1 : clamp((total - i + FADE) / FADE);
          const coveredByNext = i < n - 1 && clamp((total - (i + 1) + FADE) / FADE) >= 1;
          layer.style.opacity = String(vis);
          layer.style.visibility = vis > 0 && !coveredByNext ? "visible" : "hidden";
        }
        const media = mediaRefs.current[i];
        if (media && !reduce) media.style.transform = `scale(${(1.12 - 0.1 * local).toFixed(4)})`;
        const word = wordRefs.current[i];
        if (word) {
          const t = i === 0 ? 1 : ease(clamp((total - i + FADE) / (FADE + 0.18)));
          word.style.transform = `translate3d(0, ${((1 - t) * 60).toFixed(1)}px, 0)`;
          word.style.opacity = String(t);
        }
        const copy = copyRefs.current[i];
        if (copy) {
          const t = i === 0 ? 1 : ease(clamp((total - i) / 0.25));
          copy.style.transform = `translate3d(0, ${((1 - t) * 24).toFixed(1)}px, 0)`;
          copy.style.opacity = String(t);
        }
        // Scrub the clip
        const v = videoRefs.current[i];
        if (v && v.readyState >= 1 && v.duration) {
          if (Math.abs(i - idx) <= 1) {
            const target = local * (v.duration - 0.05);
            if (Math.abs(v.currentTime - target) > 1 / 30) v.currentTime = target;
          }
          if (Math.abs(i - idx) <= 1 && !primed.has(i)) {
            primed.add(i);
            v.preload = "auto";
          }
        }
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    videoRefs.current.forEach((v) => v?.addEventListener("loadedmetadata", request));
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(frame);
    };
  }, [n]);

  const goTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - (window.innerHeight - 64);
    window.scrollTo({ top: top + (travel * (i + 0.02)) / n, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} aria-label="A weekend with us, step by step" className="relative" style={{ height: `${n * 115}svh` }}>
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden bg-forest-900">
        {scenes.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ zIndex: i + 1, opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            {/* Media */}
            <div ref={(el) => { mediaRefs.current[i] = el; }} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.12)" }}>
              <Img src={s.image} alt="" priority={i < 2} sizes="100vw" />
              {s.video && (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={s.video}
                  poster={s.image}
                  muted
                  playsInline
                  preload={i < 2 ? "auto" : "metadata"}
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/70" />

            {/* Giant word */}
            <div ref={(el) => { wordRefs.current[i] = el; }} className="pointer-events-none absolute inset-x-0 top-[5%] text-center sm:top-[6%]" aria-hidden="true">
              <span className="font-display text-[23vw] font-extrabold leading-none tracking-[-0.04em] text-white/90 [text-shadow:0_8px_40px_rgba(0,0,0,.25)] sm:text-[17vw] lg:text-[15rem]">
                {s.word}
              </span>
            </div>

            {/* Copy */}
            <div ref={(el) => { copyRefs.current[i] = el; }} className="absolute inset-x-0 bottom-0">
              <div className="container-site pb-10 pr-20 sm:pb-14 sm:pr-24">
                {i === 0 ? (
                  <div className="max-w-2xl">
                    <h1 className="text-[2.6rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">{headline}</h1>
                    <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/85">{subheadline}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link href="/treks" className="btn-cta">
                        Explore trips
                        <span className="btn-cta-icon"><ArrowRight size={18} /></span>
                      </Link>
                      <Link href="/plan-a-trip" className="btn-ghost-light">Plan a custom trip</Link>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <p className="text-sm font-semibold text-sunset-300">
                      Step {i + 1} of {n}
                    </p>
                    <h2 className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">{s.title}</h2>
                    <p className="mt-2 text-[17px] leading-relaxed text-white/85">{s.text}</p>
                    {i === n - 1 && (
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href={finalHref} className="btn-cta">
                          Book your seat
                          <span className="btn-cta-icon"><ArrowRight size={18} /></span>
                        </Link>
                        <Link href="/treks" className="btn-ghost-light">See all trips</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Step rail */}
        <nav className="absolute right-3 top-1/2 z-30 -translate-y-1/2 sm:right-6" aria-label="Journey steps">
          <ol className="flex flex-col gap-2.5">
            {scenes.map((s, i) => (
              <li key={s.id}>
                <button type="button" onClick={() => goTo(i)} className="group flex items-center justify-end gap-2" aria-label={`Go to step ${i + 1}: ${s.word.toLowerCase()}`} aria-current={i === active ? "step" : undefined}>
                  <span className={`hidden text-xs font-semibold text-white transition-opacity sm:inline ${i === active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>
                    {s.word.charAt(0) + s.word.slice(1).toLowerCase()}
                  </span>
                  <span className={`block rounded-full bg-white transition-all ${i === active ? "h-6 w-1.5" : "h-1.5 w-1.5 opacity-60"}`} />
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Progress + skip */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-1 bg-white/15">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-sunset-500" />
        </div>
        <a href="#trips" className="absolute bottom-4 right-24 z-30 hidden items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/45 sm:inline-flex">
          Skip to trips <ArrowDown size={15} />
        </a>
        {active === 0 && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-bounce text-white/80 sm:bottom-6" aria-hidden="true">
            <ArrowDown size={22} />
          </div>
        )}
      </div>
    </section>
  );
}
