"use client";

/**
 * DEPARTURE BOARD
 * Upcoming departures shown like a railway split-flap board. The letters
 * flip into place when the board scrolls into view.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

export interface BoardRow {
  id: string;
  date: string; // "SAT 28 NOV"
  time: string; // "21:30"
  destination: string; // "KALSUBAI NIGHT TREK" (max 20 chars)
  fullName: string;
  seats: number;
  status: "Open" | "Filling Fast" | "Waitlist";
  href: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function Flap({ text, width, run, delay = 0 }: { text: string; width: number; run: number; delay?: number }) {
  const target = text.toUpperCase().padEnd(width).slice(0, width);
  const [chars, setChars] = useState<string[]>(target.split(""));
  const [settled, setSettled] = useState<boolean[]>(() => target.split("").map(() => true));

  useEffect(() => {
    if (!run) return;
    const settleAt = target.split("").map((_, i) => 6 + Math.floor(delay / 45) + i + Math.floor(Math.random() * 4));
    const last = Math.max(...settleAt);
    let f = 0;
    setSettled(target.split("").map(() => false));
    const id = setInterval(() => {
      f++;
      setChars(target.split("").map((c, i) => (f >= settleAt[i] ? c : CHARS[Math.floor(Math.random() * CHARS.length)])));
      setSettled(settleAt.map((s) => f >= s));
      if (f >= last) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [run, target, delay]);

  return (
    <span className="inline-flex" aria-hidden="true">
      {chars.map((c, i) => (
        <span key={`${i}-${settled[i] ? "s" : "u"}`} className={`flap-tile ${c === " " ? "space" : ""} ${settled[i] && run ? "animate-flap" : ""}`}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

const lamp: Record<BoardRow["status"], { color: string; label: string }> = {
  Open: { color: "#4ADE80", label: "Boarding" },
  "Filling Fast": { color: "#FBBF24", label: "Filling fast" },
  Waitlist: { color: "#F87171", label: "Full — waitlist" },
};

export default function DepartureBoard({ rows }: { rows: BoardRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const t = () =>
      setClock(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date()));
    t();
    const id = setInterval(t, 15000);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => clearInterval(id);
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(1);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    if (el) io.observe(el);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="overflow-hidden rounded-[1.25rem] bg-[#0B1510] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06),0_24px_48px_-24px_rgba(11,21,16,.6)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <p className="font-display text-lg font-bold text-[#F3EFE2] sm:text-xl">Departures from Pune</p>
        <p className="font-display text-lg font-bold tabular-nums text-sunset-300">{clock}</p>
      </div>

      <div className="hidden gap-x-4 border-b border-white/10 px-1 pb-2 text-xs font-semibold text-white/45 md:grid md:grid-cols-[9rem_4.5rem_minmax(18rem,1fr)_2.5rem_9rem_1.5rem]">
        <span>Date</span>
        <span>Time</span>
        <span>Destination</span>
        <span>Seats</span>
        <span>Status</span>
        <span />
      </div>

      <ul className="divide-y divide-white/[.07]">
        {rows.map((r, i) => {
          const l = lamp[r.status];
          const seats = r.status === "Waitlist" ? "--" : String(r.seats).padStart(2, "0");
          return (
            <li key={r.id}>
              <Link
                href={r.href}
                title={r.fullName}
                aria-label={`${r.fullName}, ${r.date}, ${r.time}. ${r.status === "Waitlist" ? "Full, join the waitlist" : `${r.seats} seats left`}`}
                className="group block rounded-xl px-1 py-3 transition-colors hover:bg-white/[.04]"
              >
                {/* Phone layout */}
                <div className="text-[13px] min-[400px]:text-[14px] md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Flap text={r.date} width={10} run={run} delay={i * 140} />
                        <Flap text={r.time} width={5} run={run} delay={i * 140 + 200} />
                      </div>
                      <Flap text={r.destination} width={20} run={run} delay={i * 140 + 300} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Flap text={seats} width={2} run={run} delay={i * 140 + 500} />
                      <span className="text-[11px] font-semibold text-white/45">seats</span>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/70">
                    <span className="h-2 w-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 10px ${l.color}` }} />
                    {l.label}
                    <ChevronRight size={16} className="ml-auto text-white/40" />
                  </p>
                </div>
                {/* Wide layout */}
                <div className="hidden items-center gap-x-4 text-[17px] md:grid md:grid-cols-[9rem_4.5rem_minmax(18rem,1fr)_2.5rem_9rem_1.5rem]">
                  <Flap text={r.date} width={10} run={run} delay={i * 140} />
                  <Flap text={r.time} width={5} run={run} delay={i * 140 + 200} />
                  <Flap text={r.destination} width={20} run={run} delay={i * 140 + 300} />
                  <Flap text={seats} width={2} run={run} delay={i * 140 + 500} />
                  <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                    <span className="h-2 w-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 10px ${l.color}` }} />
                    {l.label}
                  </span>
                  <ChevronRight size={20} className="text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
