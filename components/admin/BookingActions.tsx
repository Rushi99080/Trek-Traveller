"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import type { Booking } from "@/lib/types";
import { dateRange } from "@/lib/format";
import { site } from "@/site.config";
import { updateBookingAction } from "@/app/admin/actions";
import { WhatsAppIcon } from "../WhatsAppButton";

export default function BookingActions({ b, groupLink }: { b: Booking; groupLink: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(b.notes ?? "");
  const phone = b.contactPhone.replace(/\D/g, "").slice(-10);

  const message =
    b.status === "waitlist"
      ? `Hi ${b.contactName}, good news! A seat has opened on ${b.tripName} (${dateRange(b.batchStart, b.batchEnd)}). Reply here to confirm. Booking ID: ${b.bookingCode}`
      : `Hi ${b.contactName}, your booking for ${b.tripName} (${dateRange(b.batchStart, b.batchEnd)}) is confirmed. Booking ID: ${b.bookingCode}.\nPickup: ${b.pickup}\nItinerary: ${site.url}/treks/${b.tripSlug}/itinerary${groupLink ? `\nJoin the trip group: ${groupLink}` : ""}\nSee you on the trail!`;

  const update = (patch: Parameters<typeof updateBookingAction>[1]) =>
    start(async () => {
      await updateBookingAction(b.id, patch);
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 py-2 text-sm text-white">
          <WhatsAppIcon className="h-4 w-4" /> {b.status === "waitlist" ? "Offer seat" : "Send details"}
        </a>
        <a href={`tel:+91${phone}`} className="btn-outline px-4 py-2 text-sm"><Phone size={15} /> Call</a>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm">
          <span className="label">Payment</span>
          <select className="input py-2" disabled={pending} value={b.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value as Booking["paymentStatus"] })}>
            <option value="pending">Pending</option>
            <option value="advance">Advance paid</option>
            <option value="paid">Fully paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="label">Booking</span>
          <select className="input py-2" disabled={pending} value={b.status} onChange={(e) => update({ status: e.target.value as Booking["status"] })}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlist">Waitlist</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <input className="input py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (e.g. balance paid in cash)" aria-label="Notes" />
        <button type="button" disabled={pending} onClick={() => update({ notes })} className="btn-outline shrink-0 px-4 py-2 text-sm">Save</button>
      </div>
      <p className="text-xs text-mountain-500">Marking a booking Confirmed adds its seats to the batch; Cancelled or Refunded gives them back.</p>
    </div>
  );
}
