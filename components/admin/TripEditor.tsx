"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import type { Batch, BatchStatus, CategorySlug, Leader, Trip } from "@/lib/types";
import { categories } from "@/data/content";
import { slugify, toISODate, cn } from "@/lib/format";
import { deleteTripAction, saveTripAction, uploadImageAction } from "@/app/admin/actions";

const batchStatuses: { key: BatchStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "filling_fast", label: "Filling fast" },
  { key: "waitlist", label: "Full – waitlist" },
  { key: "sold_out", label: "Sold out (no waitlist)" },
  { key: "closed", label: "Hidden / closed" },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-mountain-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mountain-500">{hint}</span>}
    </label>
  );
}

/** Textarea where each line becomes one item in a list */
function Lines({ value, onChange, rows = 5, placeholder }: { value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  return <textarea rows={rows} value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} className="input" placeholder={placeholder} />;
}

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d;
}

export default function TripEditor({ initial, leaders, canUpload }: { initial: Trip; leaders: Leader[]; canUpload: boolean }) {
  const router = useRouter();
  const [t, setT] = useState<Trip>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(initial.slug));

  const set = <K extends keyof Trip>(k: K, v: Trip[K]) => setT((p) => ({ ...p, [k]: v }));
  const setRow = <K extends "pickupPrices" | "stayOptions" | "meetingPoints" | "faqs" | "itinerary" | "batches">(
    k: K,
    i: number,
    patch: Partial<Trip[K][number]>,
  ) => setT((p) => ({ ...p, [k]: (p[k] as unknown[]).map((r, idx) => (idx === i ? { ...(r as object), ...patch } : r)) }));
  const addRow = <K extends "pickupPrices" | "stayOptions" | "meetingPoints" | "faqs" | "itinerary" | "batches">(k: K, row: Trip[K][number]) =>
    setT((p) => ({ ...p, [k]: [...(p[k] as unknown[]), row] }));
  const removeRow = (k: "pickupPrices" | "stayOptions" | "meetingPoints" | "faqs" | "itinerary" | "batches" | "images", i: number) =>
    setT((p) => ({ ...p, [k]: (p[k] as unknown[]).filter((_, idx) => idx !== i) }));
  const moveRow = (k: "itinerary" | "images", i: number, dir: -1 | 1) =>
    setT((p) => {
      const arr = [...(p[k] as unknown[])];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, [k]: arr };
    });

  function addBatch() {
    const last = t.batches[t.batches.length - 1];
    const start = last ? new Date(last.startDate) : nextSaturday();
    if (last) start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(0, t.durationDays - 1));
    const b: Batch = {
      id: "",
      tripId: t.id,
      startDate: toISODate(start),
      endDate: toISODate(end),
      totalSeats: last?.totalSeats ?? 30,
      seatsBooked: 0,
      status: "open",
      leaderIds: last?.leaderIds ?? t.leaderIds,
      whatsappGroupLink: "",
    };
    addRow("batches", b);
  }

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImageAction(fd);
    setUploading(false);
    if (res.url) set("images", [...t.images, res.url]);
    else setMsg({ ok: false, text: res.error || "Upload failed" });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);
    const payload: Trip = {
      ...t,
      slug: slugify(t.slug || t.name),
      highlights: clean(t.highlights),
      inclusions: clean(t.inclusions),
      exclusions: clean(t.exclusions),
      thingsToCarry: clean(t.thingsToCarry),
      itinerary: t.itinerary.filter((d) => d.title || d.points.some(Boolean)).map((d) => ({ ...d, points: clean(d.points) })),
      pickupPrices: t.pickupPrices.filter((p) => p.pickup.trim() && Number(p.price) > 0).map((p) => ({ ...p, price: Number(p.price) })),
      stayOptions: t.stayOptions.filter((s) => s.name.trim()).map((s) => ({ ...s, extra: Number(s.extra) || 0 })),
      meetingPoints: t.meetingPoints.filter((m) => m.city.trim() && (m.place.trim() || m.time.trim())),
      faqs: t.faqs.filter((f) => f.q.trim() && f.a.trim()),
      batches: t.batches.map((b) => ({ ...b, endDate: b.endDate || b.startDate, totalSeats: Number(b.totalSeats) || 0, seatsBooked: Number(b.seatsBooked) || 0 })),
    };
    const res = await saveTripAction(payload);
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Saved. The website is updated." });
      if (!t.id && res.id) router.replace(`/admin/trips/${res.id}`);
      else router.refresh();
    } else setMsg({ ok: false, text: res.error || "Couldn't save" });
  }

  return (
    <div className="space-y-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/trips" className="text-sm font-semibold text-mountain-500">All trips</Link>
          <h1 className="text-2xl font-bold sm:text-3xl">{t.id ? `Edit: ${initial.name}` : "New trip"}</h1>
        </div>
        {t.id && (
          <Link href={`/treks/${initial.slug}`} target="_blank" className="btn-outline px-4 py-2 text-sm">
            <ExternalLink size={15} /> View on website
          </Link>
        )}
      </div>

      {/* ---------- Basics ---------- */}
      <Section title="Basic details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trip name" className="sm:col-span-2">
            <input
              className="input"
              value={t.name}
              onChange={(e) => {
                const name = e.target.value;
                setT((p) => ({ ...p, name, slug: slugTouched.current ? p.slug : slugify(name) }));
              }}
              placeholder="e.g. Rajgad Fort Trek"
            />
          </Field>
          <Field label="Web address" hint={`Your page will be at /treks/${t.slug || "trip-name"}`}>
            <input className="input" value={t.slug} onChange={(e) => { slugTouched.current = true; set("slug", slugify(e.target.value)); }} />
          </Field>
          <Field label="Location">
            <input className="input" value={t.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Gunjavane, near Pune" />
          </Field>
          <Field label="Region (used in filters)">
            <input className="input" value={t.region} onChange={(e) => set("region", e.target.value)} placeholder="e.g. Sahyadri – Pune" list="regions" />
          </Field>
          <Field label="Difficulty">
            <select className="input" value={t.difficulty} onChange={(e) => set("difficulty", e.target.value as Trip["difficulty"])}>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Difficult</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Number of days">
              <input className="input" inputMode="numeric" value={t.durationDays} onChange={(e) => set("durationDays", Number(e.target.value.replace(/\D/g, "")) || 1)} />
            </Field>
            <Field label="Duration text">
              <input className="input" value={t.durationLabel} onChange={(e) => set("durationLabel", e.target.value)} placeholder="2 days / 1 night" />
            </Field>
          </div>
          <Field label="Altitude">
            <input className="input" value={t.altitude} onChange={(e) => set("altitude", e.target.value)} placeholder="1,376 m" />
          </Field>
          <Field label="Distance">
            <input className="input" value={t.distance} onChange={(e) => set("distance", e.target.value)} placeholder="About 10 km round trip" />
          </Field>
          <Field label="Best season">
            <input className="input" value={t.bestSeason} onChange={(e) => set("bestSeason", e.target.value)} placeholder="June to February" />
          </Field>
          <Field label="Short description (shown on cards and Google)" className="sm:col-span-2">
            <textarea className="input" rows={2} value={t.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="label">Trip types</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = t.categories.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => set("categories", on ? t.categories.filter((x) => x !== c.slug) : [...t.categories, c.slug as CategorySlug])}
                    className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white")}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={t.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="h-5 w-5 accent-forest-600" />
            <span className="font-medium">Show this trip on the website</span>
          </label>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-md">
            <Field label="Display order" hint="Lower numbers show first">
              <input className="input" inputMode="numeric" value={t.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value.replace(/\D/g, "")) || 0)} />
            </Field>
            <Field label="Popularity (0–100)" hint="Used for 'Most popular' sort">
              <input className="input" inputMode="numeric" value={t.popularity} onChange={(e) => set("popularity", Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0))} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ---------- Photos ---------- */}
      <Section title="Photos" hint="The first photo is the cover. Use landscape photos under 5 MB.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {t.images.map((src, i) => (
            <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-mountain-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-sunset-500 px-2 py-0.5 text-xs font-semibold text-white"><Star size={12} /> Cover</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 p-1.5">
                <button type="button" onClick={() => moveRow("images", i, -1)} className="rounded-full bg-white/90 p-1.5" aria-label="Move left"><ArrowUp size={14} className="-rotate-90" /></button>
                <button type="button" onClick={() => moveRow("images", i, 1)} className="rounded-full bg-white/90 p-1.5" aria-label="Move right"><ArrowDown size={14} className="-rotate-90" /></button>
                <button type="button" onClick={() => removeRow("images", i)} className="rounded-full bg-white/90 p-1.5 text-red-600" aria-label="Remove photo"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => (canUpload ? fileRef.current?.click() : setMsg({ ok: false, text: "Connect Supabase to upload photos. You can paste an image link below for now." }))}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-mountain-200 text-sm font-medium text-mountain-500 hover:border-forest-400"
          >
            <ImagePlus size={24} /> {uploading ? "Uploading…" : "Upload photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        <div className="mt-3 flex gap-2">
          <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste an image link (https://…)" />
          <button type="button" className="btn-outline shrink-0" onClick={() => { if (imageUrl.trim()) { set("images", [...t.images, imageUrl.trim()]); setImageUrl(""); } }}>Add</button>
        </div>
      </Section>

      {/* ---------- Pricing ---------- */}
      <Section title="Prices & payment" hint="Price per person for each pickup point.">
        <div className="space-y-2">
          {t.pickupPrices.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input" value={p.pickup} onChange={(e) => setRow("pickupPrices", i, { pickup: e.target.value })} placeholder="Pickup city" aria-label="Pickup city" />
              <div className="relative w-40 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mountain-400">₹</span>
                <input className="input pl-7" inputMode="numeric" value={p.price || ""} onChange={(e) => setRow("pickupPrices", i, { price: Number(e.target.value.replace(/\D/g, "")) })} aria-label="Price" />
              </div>
              <button type="button" onClick={() => removeRow("pickupPrices", i)} className="p-2 text-mountain-400 hover:text-red-600" aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("pickupPrices", { pickup: "", price: 0 })} className="flex items-center gap-1.5 text-sm font-semibold text-forest-700"><Plus size={16} /> Add pickup point</button>
        </div>

        <h3 className="mt-6 font-semibold">Stay / sharing options <span className="font-normal text-mountain-500">(leave empty for day trips)</span></h3>
        <div className="mt-2 space-y-2">
          {t.stayOptions.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input" value={s.name} onChange={(e) => setRow("stayOptions", i, { name: e.target.value })} placeholder="e.g. Twin sharing tent" aria-label="Option name" />
              <div className="relative w-40 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mountain-400">+₹</span>
                <input className="input pl-9" inputMode="numeric" value={s.extra || ""} onChange={(e) => setRow("stayOptions", i, { extra: Number(e.target.value.replace(/\D/g, "")) })} placeholder="0" aria-label="Extra price" />
              </div>
              <button type="button" onClick={() => removeRow("stayOptions", i)} className="p-2 text-mountain-400 hover:text-red-600" aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("stayOptions", { name: "", extra: 0 })} className="flex items-center gap-1.5 text-sm font-semibold text-forest-700"><Plus size={16} /> Add stay option</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Payment">
            <select className="input" value={t.paymentMode} onChange={(e) => set("paymentMode", e.target.value as Trip["paymentMode"])}>
              <option value="full">Full payment only</option>
              <option value="advance">Allow advance payment</option>
            </select>
          </Field>
          {t.paymentMode === "advance" && (
            <Field label="Advance per person (₹)">
              <input className="input" inputMode="numeric" value={t.advanceAmount || ""} onChange={(e) => set("advanceAmount", Number(e.target.value.replace(/\D/g, "")))} />
            </Field>
          )}
          <Field label="Group discount: minimum people" hint="Leave empty for no group discount">
            <input
              className="input"
              inputMode="numeric"
              value={t.groupDiscount?.minPeople ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, ""));
                set("groupDiscount", n ? { minPeople: n, percent: t.groupDiscount?.percent ?? 5 } : null);
              }}
            />
          </Field>
          {t.groupDiscount && (
            <Field label="Group discount %">
              <input className="input" inputMode="numeric" value={t.groupDiscount.percent} onChange={(e) => set("groupDiscount", { ...t.groupDiscount!, percent: Math.min(90, Number(e.target.value.replace(/\D/g, "")) || 0) })} />
            </Field>
          )}
        </div>
      </Section>

      {/* ---------- Batches ---------- */}
      <Section title="Batches (dates)" hint="Seats booked updates automatically when people pay. Change it only to add offline bookings.">
        <div className="space-y-3">
          {t.batches.map((b, i) => (
            <div key={b.id || i} className={cn("rounded-xl border p-3", b.status === "closed" ? "border-mountain-100 bg-mountain-50" : "border-mountain-200")}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_6rem_6rem_1.3fr_auto]">
                <Field label="Start">
                  <input type="date" className="input" value={b.startDate} onChange={(e) => {
                    const start = e.target.value;
                    const end = new Date(start);
                    end.setDate(end.getDate() + Math.max(0, t.durationDays - 1));
                    setRow("batches", i, { startDate: start, endDate: start ? toISODate(end) : "" });
                  }} />
                </Field>
                <Field label="End">
                  <input type="date" className="input" value={b.endDate} onChange={(e) => setRow("batches", i, { endDate: e.target.value })} />
                </Field>
                <Field label="Seats">
                  <input className="input" inputMode="numeric" value={b.totalSeats} onChange={(e) => setRow("batches", i, { totalSeats: Number(e.target.value.replace(/\D/g, "")) })} />
                </Field>
                <Field label="Booked">
                  <input className="input" inputMode="numeric" value={b.seatsBooked} onChange={(e) => setRow("batches", i, { seatsBooked: Number(e.target.value.replace(/\D/g, "")) })} />
                </Field>
                <Field label="Status" className="col-span-2 sm:col-span-1">
                  <select className="input" value={b.status} onChange={(e) => setRow("batches", i, { status: e.target.value as BatchStatus })}>
                    {batchStatuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </Field>
                <button type="button" onClick={() => { if (confirm("Remove this batch? Batches with bookings will be hidden instead.")) removeRow("batches", i); }} className="col-span-2 self-end p-2 text-sm text-mountain-400 hover:text-red-600 sm:col-span-1" aria-label="Remove batch">
                  <Trash2 size={18} className="inline" /> <span className="sm:hidden">Remove</span>
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="label">Trek leaders</span>
                  <div className="flex flex-wrap gap-1.5">
                    {leaders.map((l) => {
                      const on = b.leaderIds.includes(l.id);
                      return (
                        <button key={l.id} type="button" onClick={() => setRow("batches", i, { leaderIds: on ? b.leaderIds.filter((x) => x !== l.id) : [...b.leaderIds, l.id] })} className={cn("rounded-full border px-2.5 py-1 text-xs", on ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white")}>
                          {l.name}
                        </button>
                      );
                    })}
                    {!leaders.length && <span className="text-xs text-mountain-500">Add leaders under Trek leaders first.</span>}
                  </div>
                </div>
                <Field label="Trip WhatsApp group link">
                  <input className="input" value={b.whatsappGroupLink ?? ""} onChange={(e) => setRow("batches", i, { whatsappGroupLink: e.target.value })} placeholder="https://chat.whatsapp.com/…" />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" onClick={addBatch} className="btn-outline px-4 py-2 text-sm"><Plus size={16} /> Add batch</button>
        </div>
      </Section>

      {/* ---------- Content ---------- */}
      <Section title="Overview & highlights">
        <Field label="Overview" hint="Leave an empty line between paragraphs.">
          <textarea className="input" rows={6} value={t.overview} onChange={(e) => set("overview", e.target.value)} />
        </Field>
        <Field label="Highlights (one per line)" className="mt-4">
          <Lines value={t.highlights} onChange={(v) => set("highlights", v)} rows={4} />
        </Field>
      </Section>

      <Section title="Day-wise itinerary">
        <div className="space-y-3">
          {t.itinerary.map((d, i) => (
            <div key={i} className="rounded-xl border border-mountain-200 p-3">
              <div className="flex gap-2">
                <input className="input w-28 shrink-0" value={d.label} onChange={(e) => setRow("itinerary", i, { label: e.target.value })} placeholder="Day 1" aria-label="Day label" />
                <input className="input" value={d.title} onChange={(e) => setRow("itinerary", i, { title: e.target.value })} placeholder="Title, e.g. Pune → Rajgad → Pune" aria-label="Day title" />
              </div>
              <textarea className="input mt-2" rows={4} value={d.points.join("\n")} onChange={(e) => setRow("itinerary", i, { points: e.target.value.split("\n") })} placeholder={"One step per line, e.g.\n5:30 am – Pickup from Pune"} aria-label="Plan for the day" />
              <div className="mt-2 flex justify-end gap-1">
                <button type="button" onClick={() => moveRow("itinerary", i, -1)} className="p-2 text-mountain-500" aria-label="Move up"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => moveRow("itinerary", i, 1)} className="p-2 text-mountain-500" aria-label="Move down"><ArrowDown size={16} /></button>
                <button type="button" onClick={() => removeRow("itinerary", i)} className="p-2 text-mountain-400 hover:text-red-600" aria-label="Remove day"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addRow("itinerary", { label: `Day ${t.itinerary.length + 1}`, title: "", points: [] })} className="btn-outline px-4 py-2 text-sm"><Plus size={16} /> Add day</button>
        </div>
      </Section>

      <Section title="Inclusions, exclusions & packing" hint="One item per line.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Included"><Lines value={t.inclusions} onChange={(v) => set("inclusions", v)} rows={7} /></Field>
          <Field label="Not included"><Lines value={t.exclusions} onChange={(v) => set("exclusions", v)} rows={7} /></Field>
          <Field label="Things to carry"><Lines value={t.thingsToCarry} onChange={(v) => set("thingsToCarry", v)} rows={7} /></Field>
          <Field label="Fitness needed"><textarea className="input" rows={7} value={t.fitness} onChange={(e) => set("fitness", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Meeting points" hint="City name must match a pickup point above to show its time on the booking page.">
        <div className="space-y-3">
          {t.meetingPoints.map((m, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-mountain-200 p-3 sm:grid-cols-[8rem_1fr_10rem_1fr_auto]">
              <input className="input" value={m.city} onChange={(e) => setRow("meetingPoints", i, { city: e.target.value })} placeholder="City" aria-label="City" />
              <input className="input" value={m.place} onChange={(e) => setRow("meetingPoints", i, { place: e.target.value })} placeholder="Exact pickup spot" aria-label="Place" />
              <input className="input" value={m.time} onChange={(e) => setRow("meetingPoints", i, { time: e.target.value })} placeholder="5:30 am" aria-label="Time" />
              <input className="input" value={m.mapsUrl ?? ""} onChange={(e) => setRow("meetingPoints", i, { mapsUrl: e.target.value })} placeholder="Google Maps link" aria-label="Google Maps link" />
              <button type="button" onClick={() => removeRow("meetingPoints", i)} className="p-2 text-mountain-400 hover:text-red-600" aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("meetingPoints", { city: "", place: "", time: "", mapsUrl: "" })} className="flex items-center gap-1.5 text-sm font-semibold text-forest-700"><Plus size={16} /> Add meeting point</button>
        </div>
      </Section>

      <Section title="Trek leaders" hint="Shown on the trip page when a batch has no leaders assigned.">
        <div className="flex flex-wrap gap-2">
          {leaders.map((l) => {
            const on = t.leaderIds.includes(l.id);
            return (
              <button key={l.id} type="button" onClick={() => set("leaderIds", on ? t.leaderIds.filter((x) => x !== l.id) : [...t.leaderIds, l.id])} className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white")}>
                {l.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="FAQs">
        <div className="space-y-3">
          {t.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-mountain-200 p-3">
              <input className="input" value={f.q} onChange={(e) => setRow("faqs", i, { q: e.target.value })} placeholder="Question" aria-label="Question" />
              <textarea className="input mt-2" rows={2} value={f.a} onChange={(e) => setRow("faqs", i, { a: e.target.value })} placeholder="Answer" aria-label="Answer" />
              <div className="text-right">
                <button type="button" onClick={() => removeRow("faqs", i)} className="p-2 text-mountain-400 hover:text-red-600" aria-label="Remove FAQ"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addRow("faqs", { q: "", a: "" })} className="flex items-center gap-1.5 text-sm font-semibold text-forest-700"><Plus size={16} /> Add FAQ</button>
        </div>
      </Section>

      {t.id && (
        <form action={deleteTripAction.bind(null, t.id)} onSubmit={(e) => { if (!confirm("Delete this trip permanently? To just hide it, untick 'Show this trip on the website' instead.")) e.preventDefault(); }}>
          <button className="text-sm font-semibold text-red-600">Delete this trip</button>
        </form>
      )}

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-[58px] z-30 border-t border-mountain-100 bg-white/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:left-60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className={cn("text-sm", msg ? (msg.ok ? "text-forest-700" : "text-red-600") : "text-mountain-500")} role="status">
            {msg?.text ?? "Changes are saved when you press Save."}
          </p>
          <button type="button" onClick={save} disabled={saving} className="btn-primary shrink-0 px-8">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <datalist id="regions">
        {["Sahyadri – Pune", "Sahyadri – Lonavala", "Sahyadri – Nashik", "Sahyadri – Malshej", "Karnataka", "Himalayas – Uttarakhand", "Himalayas – Himachal", "International"].map((r) => <option key={r} value={r} />)}
      </datalist>
    </div>
  );
}
