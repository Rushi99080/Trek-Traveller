"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Copy, ExternalLink, FileText, Hourglass, MapPin, Printer, Users } from "lucide-react";
import { useState } from "react";
import { dateRange, inr } from "@/lib/format";
import { site, whatsappLink } from "@/site.config";
import { WhatsAppIcon } from "../WhatsAppButton";
import { useBooking } from "./useBooking";

export default function BookingConfirmation() {
  const id = useSearchParams().get("id");
  const { data, state } = useBooking(id);
  const [copied, setCopied] = useState(false);

  if (state === "loading") return <div className="card h-80 animate-pulse" />;
  if (!data) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t find this booking</h1>
        <p className="mt-2 text-mountain-600">Check the link in your email, or message us with your booking ID.</p>
        <a href={whatsappLink("Hi! I need help finding my booking.")} className="btn-primary mt-5" target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
        </a>
      </div>
    );
  }

  const { booking: b, trip, groupLink } = data;
  const mp = trip.meetingPoints.find((m) => m.city === b.pickup);
  const waitlist = b.status === "waitlist";
  const pending = b.status === "pending";
  const balance = b.totalAmount - b.amountPaid;
  const shareText = `I'm going on ${b.tripName} (${dateRange(b.batchStart, b.batchEnd)}) with ${site.name}! Join me: ${site.url}/treks/${b.tripSlug}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className={`rounded-card p-6 text-center sm:p-8 ${waitlist || pending ? "bg-amber-50 ring-1 ring-amber-200" : "bg-forest-800 text-white"}`}>
        {waitlist || pending ? <Hourglass size={44} className="mx-auto text-amber-600" /> : <CheckCircle2 size={48} className="mx-auto text-sunset-300" />}
        <h1 className={`mt-3 text-3xl font-extrabold sm:text-4xl ${waitlist || pending ? "" : "text-white"}`}>
          {waitlist ? "You're on the waitlist" : pending ? "Payment pending" : "You're going!"}
        </h1>
        <p className={`mt-2 ${waitlist || pending ? "text-mountain-700" : "text-forest-100"}`}>
          {waitlist
            ? "We'll WhatsApp you as soon as a seat opens up."
            : pending
              ? "We haven't received your payment for this booking yet. If money was debited, WhatsApp us your booking ID."
              : "Show this page or your booking ID at the pickup point."}
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(b.bookingCode);
            setCopied(true);
          }}
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-lg font-bold tracking-wide ${waitlist || pending ? "bg-white text-forest-900 ring-1 ring-amber-200" : "bg-white/10 text-white"}`}
          aria-label="Copy booking ID"
        >
          Booking ID: {b.bookingCode} <Copy size={16} />
        </button>
        {copied && <p className="mt-1 text-xs opacity-80">Copied</p>}
      </div>

      {!waitlist && !pending && groupLink && (
        <a href={groupLink} target="_blank" rel="noopener noreferrer" className="btn mt-5 w-full bg-[#25D366] py-4 text-white hover:bg-[#1fb757]">
          <WhatsAppIcon className="h-5 w-5" /> Join the trip WhatsApp group
        </a>
      )}

      <div className="card mt-5 divide-y divide-mountain-100">
        <div className="p-5">
          <p className="font-display text-xl font-bold text-forest-900">{b.tripName}</p>
          <ul className="mt-3 space-y-2.5 text-[15px] text-mountain-700">
            <li className="flex gap-2.5"><CalendarDays size={18} className="mt-0.5 shrink-0 text-mountain-400" /> {dateRange(b.batchStart, b.batchEnd)}</li>
            <li className="flex gap-2.5"><Users size={18} className="mt-0.5 shrink-0 text-mountain-400" /> {b.travellersCount} {b.travellersCount === 1 ? "traveller" : "travellers"}{b.stayOption ? `, ${b.stayOption}` : ""}</li>
            <li className="flex gap-2.5">
              <MapPin size={18} className="mt-0.5 shrink-0 text-mountain-400" />
              <span>
                Pickup: <strong>{b.pickup}</strong>
                {mp && <>, {mp.place}</>}
                {mp?.mapsUrl && (
                  <a href={mp.mapsUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 font-semibold text-forest-700">
                    Map <ExternalLink size={13} />
                  </a>
                )}
              </span>
            </li>
            {mp && <li className="flex gap-2.5"><Clock size={18} className="mt-0.5 shrink-0 text-mountain-400" /> Reporting time: <strong>{mp.time}</strong></li>}
          </ul>
        </div>
        {!waitlist && (
          <dl className="space-y-1.5 p-5 text-[15px]">
            <div className="flex justify-between"><dt className="text-mountain-600">Total</dt><dd className="font-semibold">{inr(b.totalAmount)}</dd></div>
            <div className="flex justify-between"><dt className="text-mountain-600">Paid</dt><dd className="font-semibold text-forest-700">{inr(b.amountPaid)}</dd></div>
            {balance > 0 && !pending && (
              <div className="flex justify-between rounded-lg bg-sunset-50 px-3 py-2"><dt>Balance due before the trip</dt><dd className="font-bold">{inr(balance)}</dd></div>
            )}
          </dl>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href={`/treks/${b.tripSlug}/itinerary`} className="btn-outline">
          <Printer size={18} /> Itinerary (PDF)
        </Link>
        {!waitlist && !pending && (
          <Link href={`/booking/invoice?id=${b.id}`} className="btn-outline">
            <FileText size={18} /> GST invoice
          </Link>
        )}
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Share with friends
        </a>
        <a href={whatsappLink(`Hi! My booking ID is ${b.bookingCode} (${b.tripName}). I have a question.`)} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Message us
        </a>
      </div>

      {b.isDemo && <p className="mt-6 text-center text-xs text-mountain-400">Test booking — no real payment was taken.</p>}
    </div>
  );
}
