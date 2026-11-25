"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Minus, Plus, ShieldCheck, Tag, X } from "lucide-react";
import type { Coupon, Traveller, Trip } from "@/lib/types";
import { batchDisplayStatus, cn, dateRange, inr, seatsLeft, upcomingBatches } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import { idTypes } from "@/data/content";
import { site } from "@/site.config";
import { StatusBadge } from "../Badges";
import { track } from "../track";

const emptyTraveller = (): Traveller => ({
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  emergencyName: "",
  emergencyPhone: "",
  idType: idTypes[0],
  medicalNotes: "",
});

const STEPS = ["Trip", "Travellers", "Review & pay"];

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingWizard({ trip, testMode }: { trip: Trip; testMode: boolean }) {
  const router = useRouter();
  const initialBatchId = useSearchParams().get("batch") ?? undefined;
  const batches = useMemo(() => upcomingBatches(trip).filter((b) => batchDisplayStatus(b) !== "Sold Out"), [trip]);
  const storageKey = `booking-draft:${trip.slug}`;

  const [step, setStep] = useState(0);
  const [batchId, setBatchId] = useState(initialBatchId && batches.some((b) => b.id === initialBatchId) ? initialBatchId : batches[0]?.id ?? "");
  const [pickup, setPickup] = useState(trip.pickupPrices[0]?.pickup ?? "");
  const [stayOption, setStayOption] = useState(trip.stayOptions[0]?.name ?? "");
  const [count, setCount] = useState(1);
  const [travellers, setTravellers] = useState<Traveller[]>([emptyTraveller()]);
  const [sameEmergency, setSameEmergency] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [paymentOption, setPaymentOption] = useState<"full" | "advance">("full");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [demoPay, setDemoPay] = useState<{ bookingId: string; amount: number; booking: unknown } | null>(null);

  // Restore a half-filled form (e.g. after switching to a UPI app and back)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved) {
        if (saved.travellers?.length) setTravellers(saved.travellers);
        if (saved.count) setCount(saved.count);
        if (saved.pickup) setPickup(saved.pickup);
        if (saved.stayOption) setStayOption(saved.stayOption);
      }
    } catch {}
    track("InitiateCheckout", { content_name: trip.name, content_ids: [trip.slug] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ travellers, count, pickup, stayOption }));
    } catch {}
  }, [storageKey, travellers, count, pickup, stayOption]);

  const batch = batches.find((b) => b.id === batchId);
  const waitlist = batch ? batchDisplayStatus(batch) === "Waitlist" : false;
  const maxCount = batch ? (waitlist ? 10 : Math.min(10, seatsLeft(batch))) : 1;

  useEffect(() => {
    if (count > maxCount) setCount(Math.max(1, maxCount));
  }, [maxCount, count]);

  // Keep the traveller list the same length as the count
  useEffect(() => {
    setTravellers((prev) => {
      if (prev.length === count) return prev;
      if (prev.length > count) return prev.slice(0, count);
      return [...prev, ...Array.from({ length: count - prev.length }, emptyTraveller)];
    });
  }, [count]);

  const price = calculatePrice({ trip, pickup, stayOption, count, coupon, paymentOption });

  const updateTraveller = (i: number, k: keyof Traveller, v: string) => {
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));
    setErrors((e) => {
      const n = { ...e };
      delete n[`${i}.${k}`];
      return n;
    });
  };

  function validateTravellers() {
    const e: Record<string, string> = {};
    travellers.forEach((t, i) => {
      if (!t.name.trim()) e[`${i}.name`] = "Enter the full name";
      if (!t.age || Number(t.age) < 1 || Number(t.age) > 99) e[`${i}.age`] = "Enter age";
      if (!t.gender) e[`${i}.gender`] = "Select one";
      if (!/^[6-9]\d{9}$/.test(t.phone.replace(/\D/g, "").slice(-10))) e[`${i}.phone`] = "Enter a 10-digit mobile number";
      if (i === 0) {
        if (!/^\S+@\S+\.\S+$/.test(t.email)) e[`${i}.email`] = "Enter a valid email";
        if (!t.emergencyName.trim()) e[`${i}.emergencyName`] = "Enter a name";
        if (!/^\d{10}$/.test(t.emergencyPhone.replace(/\D/g, "").slice(-10))) e[`${i}.emergencyPhone`] = "Enter a 10-digit number";
      }
    });
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector(`[data-field="${Object.keys(e)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function next() {
    setFormError("");
    if (step === 0) {
      if (!batch) return setFormError("Choose a date to continue.");
      if (!pickup) return setFormError("Choose a pickup point.");
    }
    if (step === 1 && !validateTravellers()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function applyCoupon() {
    setCouponMsg("");
    if (!couponInput.trim()) return;
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, tripSlug: trip.slug, count }),
    }).then((r) => r.json());
    if (res.ok) {
      setCoupon(res.coupon);
      setCouponMsg(`${res.coupon.code} applied`);
    } else {
      setCoupon(null);
      setCouponMsg(res.error);
    }
  }

  function finish(bookingId: string, payload: unknown) {
    try {
      sessionStorage.setItem(`booking:${bookingId}`, JSON.stringify(payload));
      sessionStorage.removeItem(storageKey);
    } catch {}
    router.push(`/booking?id=${bookingId}`);
  }

  async function pay() {
    setFormError("");
    if (!agree) return setFormError("Please accept the cancellation policy and terms to continue.");
    setBusy(true);
    try {
      const finalTravellers = travellers.map((t, i) =>
        i > 0 && sameEmergency ? { ...t, emergencyName: travellers[0].emergencyName, emergencyPhone: travellers[0].emergencyPhone } : t,
      );
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripSlug: trip.slug,
          batchId,
          pickup,
          stayOption,
          count,
          travellers: finalTravellers,
          couponCode: coupon?.code ?? "",
          paymentOption,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const extra = { trip: { meetingPoints: trip.meetingPoints }, groupLink: batch?.whatsappGroupLink || site.whatsappCommunity };

      if (data.waitlist) return finish(data.booking.id, { booking: data.booking, ...extra });

      if (data.demo) {
        setDemoPay({ bookingId: data.booking.id, amount: data.booking.amountDueNow, booking: data.booking });
        setBusy(false);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Couldn't load the payment window. Check your internet and try again.");
      const lead = finalTravellers[0];
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: site.name,
        description: `${trip.name} — ${dateRange(batch!.startDate, batch!.endDate)}`,
        order_id: data.order.id,
        prefill: { name: lead.name, email: lead.email, contact: lead.phone },
        notes: { booking_code: data.booking.bookingCode },
        theme: { color: "#1B4732" },
        handler: async (resp: any) => {
          setBusy(true);
          const v = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: data.booking.id, ...resp }),
          }).then((r) => r.json());
          if (v.ok) {
            track("Purchase", { value: v.booking.amountPaid, content_name: trip.name, content_ids: [trip.slug] });
            finish(data.booking.id, { booking: v.booking, ...extra });
          } else {
            setBusy(false);
            setFormError(`Payment received but not verified yet. Your booking ID is ${data.booking.bookingCode} — please WhatsApp us and we'll confirm it.`);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setFormError("Payment wasn't completed. You can try again — no money has been taken.");
          },
        },
      });
      rzp.on("payment.failed", (r: any) => {
        setFormError(r?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (e) {
      setBusy(false);
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function confirmDemoPayment() {
    if (!demoPay) return;
    setBusy(true);
    const v = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: demoPay.bookingId, demo: true, booking: demoPay.booking }),
    }).then((r) => r.json());
    if (v.ok) {
      track("Purchase", { value: v.booking.amountPaid, content_name: trip.name });
      finish(demoPay.bookingId, { booking: v.booking, trip: { meetingPoints: trip.meetingPoints }, groupLink: batch?.whatsappGroupLink || site.whatsappCommunity });
    } else {
      setBusy(false);
      setDemoPay(null);
      setFormError(v.error || "Something went wrong");
    }
  }

  const field = (i: number, k: keyof Traveller) => errors[`${i}.${k}`];
  const inputCls = (i: number, k: keyof Traveller) => cn("input", field(i, k) && "border-red-400 focus:border-red-500 focus:ring-red-500/20");

  if (!batches.length) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold">No dates open right now</h2>
        <p className="mt-2 text-mountain-600">All batches for this trip are full. Message us and we&apos;ll tell you when new dates open.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {/* Progress */}
        <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-forest-600" : "bg-mountain-200")} />
              <p className={cn("mt-2 text-xs font-semibold sm:text-sm", i === step ? "text-forest-800" : "text-mountain-400")}>
                {i + 1}. {s}
              </p>
            </li>
          ))}
        </ol>

        {testMode && (
          <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            Test mode: payments are simulated until Razorpay keys are added.
          </p>
        )}

        {/* ---------- Step 1: trip details ---------- */}
        {step === 0 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="mb-3 font-display text-xl font-bold text-forest-900">Choose your date</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {batches.map((b) => {
                  const st = batchDisplayStatus(b);
                  const on = b.id === batchId;
                  return (
                    <label key={b.id} className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition-colors", on ? "border-forest-600 ring-2 ring-forest-600/20" : "border-mountain-200 hover:border-forest-300")}>
                      <input type="radio" name="batch" value={b.id} checked={on} onChange={() => setBatchId(b.id)} className="sr-only" />
                      <span>
                        <span className="flex items-center gap-2 font-semibold text-forest-900">
                          <CalendarDays size={16} className="text-mountain-400" /> {dateRange(b.startDate, b.endDate)}
                        </span>
                        <span className="mt-1 block text-xs text-mountain-500">{st === "Waitlist" ? "Full — join the waitlist" : `${seatsLeft(b)} seats left`}</span>
                      </span>
                      <StatusBadge status={st} />
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-display text-xl font-bold text-forest-900">Pickup point</legend>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {trip.pickupPrices.map((p) => {
                  const on = p.pickup === pickup;
                  const mp = trip.meetingPoints.find((m) => m.city === p.pickup);
                  return (
                    <label key={p.pickup} className={cn("cursor-pointer rounded-2xl border bg-white p-4 transition-colors", on ? "border-forest-600 ring-2 ring-forest-600/20" : "border-mountain-200 hover:border-forest-300")}>
                      <input type="radio" name="pickup" value={p.pickup} checked={on} onChange={() => setPickup(p.pickup)} className="sr-only" />
                      <span className="block font-semibold text-forest-900">{p.pickup}</span>
                      <span className="block font-display text-lg font-bold text-forest-700">{inr(p.price)}</span>
                      {mp && <span className="mt-1 block text-xs text-mountain-500">{mp.time}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {trip.stayOptions.length > 0 && (
              <fieldset>
                <legend className="mb-3 font-display text-xl font-bold text-forest-900">Stay</legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {trip.stayOptions.map((s) => {
                    const on = s.name === stayOption;
                    return (
                      <label key={s.name} className={cn("flex cursor-pointer items-center justify-between rounded-2xl border bg-white p-4", on ? "border-forest-600 ring-2 ring-forest-600/20" : "border-mountain-200 hover:border-forest-300")}>
                        <input type="radio" name="stay" value={s.name} checked={on} onChange={() => setStayOption(s.name)} className="sr-only" />
                        <span className="font-semibold text-forest-900">{s.name}</span>
                        <span className="text-sm font-semibold text-mountain-600">{s.extra ? `+ ${inr(s.extra)}` : "Included"}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div>
              <h2 className="mb-3 font-display text-xl font-bold text-forest-900">Number of travellers</h2>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} className="flex h-12 w-12 items-center justify-center rounded-full border border-mountain-200 bg-white disabled:opacity-40" aria-label="Fewer travellers">
                  <Minus size={20} />
                </button>
                <span className="w-10 text-center font-display text-3xl font-bold tabular-nums" aria-live="polite">{count}</span>
                <button type="button" onClick={() => setCount((c) => Math.min(maxCount, c + 1))} disabled={count >= maxCount} className="flex h-12 w-12 items-center justify-center rounded-full border border-mountain-200 bg-white disabled:opacity-40" aria-label="More travellers">
                  <Plus size={20} />
                </button>
              </div>
              {trip.groupDiscount && (
                <p className="mt-3 text-sm text-mountain-600">
                  {count >= trip.groupDiscount.minPeople
                    ? `Group discount of ${trip.groupDiscount.percent}% applied.`
                    : `Book ${trip.groupDiscount.minPeople} or more together and save ${trip.groupDiscount.percent}%.`}
                </p>
              )}
              {count >= 10 && <p className="mt-2 text-sm text-mountain-600">More than 10 people? <a href="/plan-a-trip" className="font-semibold text-forest-700 underline">Send us a group enquiry</a>.</p>}
            </div>
          </div>
        )}

        {/* ---------- Step 2: travellers ---------- */}
        {step === 1 && (
          <div className="space-y-6">
            {travellers.map((t, i) => (
              <fieldset key={i} className="card p-5">
                <legend className="sr-only">Traveller {i + 1}</legend>
                <h2 className="font-display text-xl font-bold text-forest-900">{i === 0 ? "Your details" : `Traveller ${i + 1}`}</h2>
                {i === 0 && <p className="mt-1 text-sm text-mountain-500">We&apos;ll send your booking details to this phone and email.</p>}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2" data-field={`${i}.name`}>
                    <label className="label" htmlFor={`name-${i}`}>Full name (as on ID)</label>
                    <input id={`name-${i}`} autoComplete={i === 0 ? "name" : "off"} value={t.name} onChange={(e) => updateTraveller(i, "name", e.target.value)} className={inputCls(i, "name")} />
                    {field(i, "name") && <p className="mt-1 text-sm text-red-600">{field(i, "name")}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div data-field={`${i}.age`}>
                      <label className="label" htmlFor={`age-${i}`}>Age</label>
                      <input id={`age-${i}`} inputMode="numeric" value={t.age} onChange={(e) => updateTraveller(i, "age", e.target.value.replace(/\D/g, "").slice(0, 2))} className={inputCls(i, "age")} />
                      {field(i, "age") && <p className="mt-1 text-sm text-red-600">{field(i, "age")}</p>}
                    </div>
                    <div data-field={`${i}.gender`}>
                      <label className="label" htmlFor={`gender-${i}`}>Gender</label>
                      <select id={`gender-${i}`} value={t.gender} onChange={(e) => updateTraveller(i, "gender", e.target.value)} className={inputCls(i, "gender")}>
                        <option value="">Select</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                      {field(i, "gender") && <p className="mt-1 text-sm text-red-600">{field(i, "gender")}</p>}
                    </div>
                  </div>
                  <div data-field={`${i}.phone`}>
                    <label className="label" htmlFor={`phone-${i}`}>Mobile number</label>
                    <input id={`phone-${i}`} type="tel" inputMode="tel" autoComplete={i === 0 ? "tel" : "off"} value={t.phone} onChange={(e) => updateTraveller(i, "phone", e.target.value)} className={inputCls(i, "phone")} placeholder="10-digit number" />
                    {field(i, "phone") && <p className="mt-1 text-sm text-red-600">{field(i, "phone")}</p>}
                  </div>
                  <div data-field={`${i}.email`}>
                    <label className="label" htmlFor={`email-${i}`}>Email{i > 0 && <span className="font-normal text-mountain-400"> (optional)</span>}</label>
                    <input id={`email-${i}`} type="email" autoComplete={i === 0 ? "email" : "off"} value={t.email} onChange={(e) => updateTraveller(i, "email", e.target.value)} className={inputCls(i, "email")} />
                    {field(i, "email") && <p className="mt-1 text-sm text-red-600">{field(i, "email")}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor={`id-${i}`}>ID you&apos;ll carry</label>
                    <select id={`id-${i}`} value={t.idType} onChange={(e) => updateTraveller(i, "idType", e.target.value)} className="input">
                      {idTypes.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>

                  {(i === 0 || !sameEmergency) && (
                    <>
                      <div data-field={`${i}.emergencyName`}>
                        <label className="label" htmlFor={`en-${i}`}>Emergency contact name{i > 0 && <span className="font-normal text-mountain-400"> (optional)</span>}</label>
                        <input id={`en-${i}`} value={t.emergencyName} onChange={(e) => updateTraveller(i, "emergencyName", e.target.value)} className={inputCls(i, "emergencyName")} />
                        {field(i, "emergencyName") && <p className="mt-1 text-sm text-red-600">{field(i, "emergencyName")}</p>}
                      </div>
                      <div data-field={`${i}.emergencyPhone`}>
                        <label className="label" htmlFor={`ep-${i}`}>Emergency contact number{i > 0 && <span className="font-normal text-mountain-400"> (optional)</span>}</label>
                        <input id={`ep-${i}`} type="tel" inputMode="tel" value={t.emergencyPhone} onChange={(e) => updateTraveller(i, "emergencyPhone", e.target.value)} className={inputCls(i, "emergencyPhone")} />
                        {field(i, "emergencyPhone") && <p className="mt-1 text-sm text-red-600">{field(i, "emergencyPhone")}</p>}
                      </div>
                    </>
                  )}
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor={`med-${i}`}>Medical conditions or allergies <span className="font-normal text-mountain-400">(optional)</span></label>
                    <input id={`med-${i}`} value={t.medicalNotes} onChange={(e) => updateTraveller(i, "medicalNotes", e.target.value)} className="input" placeholder="e.g. asthma, knee injury, food allergy" />
                  </div>
                </div>
                {i === 0 && count > 1 && (
                  <label className="mt-4 flex items-center gap-2.5 text-sm text-mountain-700">
                    <input type="checkbox" checked={sameEmergency} onChange={(e) => setSameEmergency(e.target.checked)} className="h-4 w-4 accent-forest-600" />
                    Use this emergency contact for everyone in my group
                  </label>
                )}
              </fieldset>
            ))}
          </div>
        )}

        {/* ---------- Step 3: review & pay ---------- */}
        {step === 2 && batch && (
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="font-display text-xl font-bold text-forest-900">Review your booking</h2>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
                <dt className="text-mountain-500">Trip</dt><dd className="font-semibold">{trip.name}</dd>
                <dt className="text-mountain-500">Date</dt><dd className="font-semibold">{dateRange(batch.startDate, batch.endDate)}</dd>
                <dt className="text-mountain-500">Pickup</dt><dd className="font-semibold">{pickup}</dd>
                {stayOption && (<><dt className="text-mountain-500">Stay</dt><dd className="font-semibold">{stayOption}</dd></>)}
                <dt className="text-mountain-500">Travellers</dt><dd className="font-semibold">{travellers.map((t) => t.name).join(", ")}</dd>
              </dl>
              <button type="button" onClick={() => setStep(0)} className="mt-3 text-sm font-semibold text-forest-700">Change</button>
            </div>

            {!waitlist && (
              <>
                <div className="card p-5">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-900"><Tag size={18} /> Coupon or referral code</h2>
                  {coupon ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-forest-50 px-4 py-3">
                      <span className="text-sm font-semibold text-forest-800">{coupon.code} — {coupon.description}</span>
                      <button type="button" onClick={() => { setCoupon(null); setCouponMsg(""); setCouponInput(""); }} aria-label="Remove coupon" className="text-mountain-500"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter code" className="input uppercase" aria-label="Coupon code" />
                      <button type="button" onClick={applyCoupon} className="btn-outline shrink-0 px-5">Apply</button>
                    </div>
                  )}
                  {couponMsg && !coupon && <p className="mt-2 text-sm text-red-600">{couponMsg}</p>}
                </div>

                {price.advanceAvailable && (
                  <fieldset className="card p-5">
                    <legend className="sr-only">Payment option</legend>
                    <h2 className="font-display text-lg font-bold text-forest-900">How much do you want to pay now?</h2>
                    <div className="mt-3 grid gap-2.5">
                      {(["full", "advance"] as const).map((opt) => {
                        const amt = opt === "full" ? price.total : Math.min(price.total, trip.advanceAmount * count);
                        const on = paymentOption === opt;
                        return (
                          <label key={opt} className={cn("flex cursor-pointer items-center justify-between rounded-xl border p-4", on ? "border-forest-600 ring-2 ring-forest-600/20" : "border-mountain-200")}>
                            <span className="flex items-center gap-3">
                              <input type="radio" name="payopt" checked={on} onChange={() => setPaymentOption(opt)} className="h-4 w-4 accent-forest-600" />
                              <span>
                                <span className="block font-semibold">{opt === "full" ? "Pay full amount" : "Pay advance to reserve"}</span>
                                {opt === "advance" && <span className="block text-xs text-mountain-500">Pay the rest before the trip</span>}
                              </span>
                            </span>
                            <span className="font-display font-bold">{inr(amt)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              </>
            )}

            {waitlist && (
              <div className="rounded-card bg-amber-50 p-5 ring-1 ring-amber-200">
                <h2 className="font-display text-lg font-bold text-amber-900">This date is full — join the waitlist</h2>
                <p className="mt-1 text-[15px] text-amber-900">No payment now. If a seat opens up, we&apos;ll WhatsApp you and you can pay then.</p>
              </div>
            )}

            <label className="flex items-start gap-3 text-sm text-mountain-700">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-forest-600" />
              <span>
                I agree to the <a href="/policies/cancellation-refund" target="_blank" className="font-semibold text-forest-700 underline">cancellation policy</a>,{" "}
                <a href="/policies/terms" target="_blank" className="font-semibold text-forest-700 underline">terms</a> and{" "}
                <a href="/policies/safety" target="_blank" className="font-semibold text-forest-700 underline">safety guidelines</a>, and confirm that everyone in my group is fit for this trip.
              </span>
            </label>
          </div>
        )}

        {formError && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {formError}
          </p>
        )}

        {/* Navigation (desktop) */}
        <div className="mt-8 hidden items-center justify-between lg:flex">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1.5 font-semibold text-mountain-600">
              <ArrowLeft size={18} /> Back
            </button>
          ) : <span />}
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-forest px-8">Continue</button>
          ) : (
            <button type="button" onClick={pay} disabled={busy} className="btn-primary px-8">
              {busy ? "Please wait…" : waitlist ? "Join waitlist" : `Pay ${inr(price.payNow)}`}
            </button>
          )}
        </div>
      </div>

      {/* ---------- Summary ---------- */}
      <aside>
        <div className="card p-5 lg:sticky lg:top-24">
          <p className="font-display text-lg font-bold text-forest-900">{trip.name}</p>
          {batch && <p className="text-sm text-mountain-500">{dateRange(batch.startDate, batch.endDate)} | from {pickup}</p>}
          <dl className="mt-4 space-y-2 border-t border-mountain-100 pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-mountain-600">{inr(price.perPerson + price.stayExtra)} × {count}</dt>
              <dd>{inr(price.subtotal)}</dd>
            </div>
            {price.groupDiscount > 0 && (
              <div className="flex justify-between text-forest-700">
                <dt>Group discount</dt>
                <dd>− {inr(price.groupDiscount)}</dd>
              </div>
            )}
            {price.couponDiscount > 0 && (
              <div className="flex justify-between text-forest-700">
                <dt>Coupon {coupon?.code}</dt>
                <dd>− {inr(price.couponDiscount)}</dd>
              </div>
            )}
            {!site.pricesIncludeGst && (
              <div className="flex justify-between">
                <dt className="text-mountain-600">GST ({site.gstRate}%)</dt>
                <dd>{inr(price.gst)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-mountain-100 pt-2 font-display text-lg font-bold text-forest-900">
              <dt>Total</dt>
              <dd>{inr(price.total)}</dd>
            </div>
            {site.pricesIncludeGst && <p className="text-xs text-mountain-500">Includes GST</p>}
            {!waitlist && price.balance > 0 && (
              <div className="flex justify-between rounded-lg bg-sunset-50 px-3 py-2 text-sm">
                <dt>Pay now / later</dt>
                <dd className="font-semibold">{inr(price.payNow)} / {inr(price.balance)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-mountain-500">
            <ShieldCheck size={16} className="text-forest-600" /> Secure payment by Razorpay: UPI, cards, net banking
          </p>
        </div>
      </aside>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mountain-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-mountain-200" aria-label="Back">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-lg font-bold text-forest-900">{waitlist ? "Waitlist" : inr(step === 2 ? price.payNow : price.total)}</p>
            <p className="truncate text-xs text-mountain-500">{count} {count === 1 ? "traveller" : "travellers"}{step === 2 && price.balance > 0 ? " | advance" : ""}</p>
          </div>
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-forest px-7">Continue</button>
          ) : (
            <button type="button" onClick={pay} disabled={busy} className="btn-primary px-6">
              {busy ? "Please wait…" : waitlist ? "Join waitlist" : "Pay now"}
            </button>
          )}
        </div>
      </div>

      {/* Test-mode payment window */}
      {demoPay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Test payment">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6">
            <p className="text-xs font-semibold text-amber-700">TEST PAYMENT — no money is charged</p>
            <h2 className="mt-2 text-2xl font-bold">Pay {inr(demoPay.amount)}</h2>
            <p className="mt-1 text-sm text-mountain-600">Once Razorpay keys are added, this becomes the real Razorpay window with UPI, cards and net banking.</p>
            <div className="mt-5 grid gap-2.5">
              <button type="button" onClick={confirmDemoPayment} disabled={busy} className="btn-primary w-full">
                <Check size={18} /> {busy ? "Confirming…" : "Simulate successful payment"}
              </button>
              <button type="button" onClick={() => { setDemoPay(null); setFormError("Payment wasn't completed. You can try again."); }} className="btn-outline w-full">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
