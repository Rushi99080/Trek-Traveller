"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import type { Enquiry } from "@/lib/types";
import { updateEnquiryAction } from "@/app/admin/actions";
import { enquiryStatuses } from "./ui";
import { WhatsAppIcon } from "../WhatsAppButton";

export default function EnquiryCard({ e }: { e: Enquiry }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(e.notes);
  const phone = e.phone.replace(/\D/g, "").slice(-10);
  const tone = enquiryStatuses.find((s) => s.key === e.status)?.tone ?? "";
  const update = (patch: { status?: string; notes?: string }) =>
    start(async () => {
      await updateEnquiryAction(e.id, patch);
      router.refresh();
    });

  const facts = [
    ["Group", e.groupSize ? `${e.groupSize} people` : ""],
    ["Type", e.tripType],
    ["Destination", e.destination],
    ["Dates", e.preferredDates],
    ["Budget", e.budget],
    ["Email", e.email],
  ].filter(([, v]) => v);

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-forest-900">
            {e.name} <span className="ml-1 text-xs font-medium text-mountain-500">{e.type === "custom" ? "Custom trip" : "Contact form"}</span>
          </p>
          <p className="text-sm text-mountain-500">{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone}`}>{enquiryStatuses.find((s) => s.key === e.status)?.label}</span>
      </div>
      {facts.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-mountain-500">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      )}
      {e.message && <p className="mt-3 rounded-lg bg-mountain-50 p-3 text-sm text-mountain-700">{e.message}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${e.name.split(" ")[0]}, thanks for your enquiry!`)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 py-2 text-sm text-white">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </a>
        <a href={`tel:+91${phone}`} className="btn-outline px-4 py-2 text-sm"><Phone size={15} /> {e.phone}</a>
        <select className="input w-auto py-2 text-sm" value={e.status} disabled={pending} onChange={(ev) => update({ status: ev.target.value })} aria-label="Status">
          {enquiryStatuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
      <div className="mt-2 flex gap-2">
        <input className="input py-2 text-sm" value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Notes, e.g. quoted ₹2,400 pp" aria-label="Notes" />
        <button type="button" disabled={pending} onClick={() => update({ notes })} className="btn-outline shrink-0 px-4 py-2 text-sm">Save</button>
      </div>
    </li>
  );
}
