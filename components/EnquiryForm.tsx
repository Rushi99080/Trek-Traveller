"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { whatsappLink } from "@/site.config";
import { WhatsAppIcon } from "./WhatsAppButton";
import { track } from "./track";

const tripTypes = ["Friends", "Family", "Corporate", "College", "Couple", "Other"];
const budgets = ["Under ₹2,000", "₹2,000 – ₹5,000", "₹5,000 – ₹10,000", "₹10,000 – ₹25,000", "₹25,000+", "Not sure yet"];

export default function EnquiryForm({ variant = "custom" }: { variant?: "custom" | "contact" }) {
  const params = useSearchParams();
  const presetType = params.get("type") ?? "";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    groupSize: "",
    destination: params.get("destination") ?? "",
    preferredDates: "",
    budget: "",
    tripType: tripTypes.includes(presetType) ? presetType : "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 10) {
      setError("Please add your name and a 10-digit phone number.");
      return;
    }
    setStatus("sending");
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: variant }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      setStatus("idle");
      setError(data?.error || "Couldn't send right now. Please WhatsApp us instead.");
      return;
    }
    track("Lead", { content_name: variant === "custom" ? "Custom trip enquiry" : "Contact form" });
    setStatus("done");
  }

  if (status === "done") {
    const summary =
      variant === "custom"
        ? `Hi! I just sent a custom trip enquiry.\nName: ${form.name}\nGroup: ${form.groupSize || "-"} (${form.tripType || "-"})\nDestination: ${form.destination || "-"}\nDates: ${form.preferredDates || "-"}\nBudget: ${form.budget || "-"}`
        : `Hi! I just sent a message on your website. Name: ${form.name}`;
    return (
      <div className="card p-6 text-center sm:p-8">
        <CheckCircle2 size={44} className="mx-auto text-forest-600" />
        <h2 className="mt-3 text-2xl font-bold">Thanks, {form.name.split(" ")[0]}!</h2>
        <p className="mt-2 text-mountain-600">
          {variant === "custom" ? "We'll call or WhatsApp you within one working day with a plan and quote." : "We'll get back to you within one working day."}
        </p>
        <a href={whatsappLink(summary)} target="_blank" rel="noopener noreferrer" className="btn mt-5 bg-[#25D366] text-white hover:bg-[#1fb757]">
          <WhatsAppIcon className="h-5 w-5" /> Want a faster reply? WhatsApp us
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-7" noValidate>
      <input type="text" name="website" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div>
        <label className="label" htmlFor="e-name">Your name</label>
        <input id="e-name" autoComplete="name" value={form.name} onChange={set("name")} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="e-phone">Phone (WhatsApp)</label>
        <input id="e-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className="input" required />
      </div>
      <div className={variant === "contact" ? "sm:col-span-2" : ""}>
        <label className="label" htmlFor="e-email">Email <span className="font-normal text-mountain-400">(optional)</span></label>
        <input id="e-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className="input" />
      </div>

      {variant === "custom" && (
        <>
          <div>
            <label className="label" htmlFor="e-size">Group size</label>
            <input id="e-size" inputMode="numeric" value={form.groupSize} onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className="input" placeholder="e.g. 12" />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Who&apos;s travelling?</legend>
            <div className="flex flex-wrap gap-2">
              {tripTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tripType: f.tripType === t ? "" : t }))}
                  aria-pressed={form.tripType === t}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${form.tripType === t ? "border-forest-700 bg-forest-700 text-white" : "border-mountain-200 bg-white text-mountain-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="e-dest">Destination ideas</label>
            <input id="e-dest" value={form.destination} onChange={set("destination")} className="input" placeholder="e.g. Harishchandragad, Lonavala camping, Manali" />
          </div>
          <div>
            <label className="label" htmlFor="e-dates">Preferred dates</label>
            <input id="e-dates" value={form.preferredDates} onChange={set("preferredDates")} className="input" placeholder="e.g. 2nd weekend of January" />
          </div>
          <div>
            <label className="label" htmlFor="e-budget">Budget per person</label>
            <select id="e-budget" value={form.budget} onChange={set("budget")} className="input">
              <option value="">Select</option>
              {budgets.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label className="label" htmlFor="e-msg">{variant === "custom" ? "Special requirements" : "Message"} {variant === "custom" && <span className="font-normal text-mountain-400">(optional)</span>}</label>
        <textarea id="e-msg" rows={4} value={form.message} onChange={set("message")} className="input" placeholder={variant === "custom" ? "Food preferences, activities, pickup location, kids or seniors in the group…" : "How can we help?"} />
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full sm:w-auto sm:px-8">
          {status === "sending" ? "Sending…" : variant === "custom" ? "Send my trip request" : "Send message"}
        </button>
      </div>
    </form>
  );
}
