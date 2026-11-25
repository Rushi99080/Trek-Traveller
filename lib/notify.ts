import "server-only";
import { site } from "@/site.config";
import { dateRange, inr } from "./format";
import type { Booking, Enquiry, Trip } from "./types";

/**
 * NOTIFICATIONS
 * - Email: works when RESEND_API_KEY is set (free plan at resend.com).
 * - WhatsApp: automatic messages need the WhatsApp Business (Cloud) API.
 *   Until then, the confirmation page and admin panel give one-tap
 *   WhatsApp buttons instead.
 * Nothing here ever blocks a booking: failures are logged and ignored.
 */

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("Email failed", await res.text());
  } catch (e) {
    console.error("Email failed", e);
  }
}

/** Optional: WhatsApp Cloud API template message (set up later) */
async function sendWhatsAppTemplate(toPhone: string, template: string, params: string[]) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return;
  const to = toPhone.replace(/\D/g, "").replace(/^0/, "");
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.length === 10 ? `91${to}` : to,
        type: "template",
        template: {
          name: template,
          language: { code: "en" },
          components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }],
        },
      }),
    });
    if (!res.ok) console.error("WhatsApp failed", await res.text());
  } catch (e) {
    console.error("WhatsApp failed", e);
  }
}

const wrap = (body: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#272D33">
  <div style="background:#1B4732;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;font-size:18px;font-weight:bold">${site.name}</div>
  <div style="border:1px solid #E1E5E8;border-top:0;padding:22px;border-radius:0 0 12px 12px;line-height:1.55">${body}</div>
  <p style="font-size:12px;color:#76828C;margin-top:12px">${site.name} | ${site.phone} | ${site.email}</p>
</div>`;

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#5B6670">${k}</td><td style="padding:6px 0;font-weight:bold">${v}</td></tr>`;

export async function notifyBookingConfirmed(b: Booking, trip: Trip | null, groupLink: string) {
  const mp = trip?.meetingPoints.find((m) => m.city === b.pickup);
  const url = site.url;
  const waitlist = b.status === "waitlist";
  const html = wrap(`
    <h2 style="margin:0 0 6px;color:#0E271B">${waitlist ? "You're on the waitlist" : "Your seat is confirmed!"}</h2>
    <p>Hi ${b.contactName}, ${waitlist ? `we've added you to the waitlist for <b>${b.tripName}</b>. We'll message you on WhatsApp if a seat opens.` : `thanks for booking <b>${b.tripName}</b>. Here are your details.`}</p>
    <table style="border-collapse:collapse;margin:14px 0">
      ${row("Booking ID", b.bookingCode)}
      ${row("Trip", b.tripName)}
      ${row("Date", dateRange(b.batchStart, b.batchEnd))}
      ${row("Pickup", `${b.pickup}${mp ? ` — ${mp.place}, ${mp.time}` : ""}`)}
      ${row("Travellers", String(b.travellersCount))}
      ${waitlist ? "" : row("Paid", inr(b.amountPaid))}
      ${!waitlist && b.totalAmount > b.amountPaid ? row("Balance due before trip", inr(b.totalAmount - b.amountPaid)) : ""}
    </table>
    ${mp?.mapsUrl ? `<p><a href="${mp.mapsUrl}">Open pickup point in Google Maps</a></p>` : ""}
    ${!waitlist && groupLink ? `<p><a href="${groupLink}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Join the trip WhatsApp group</a></p>` : ""}
    <p><a href="${url}/treks/${b.tripSlug}/itinerary">Download itinerary (PDF)</a><br/>
    ${waitlist ? "" : `<a href="${url}/booking/invoice?id=${b.id}">Download GST invoice</a><br/>`}
    <a href="${url}/booking?id=${b.id}">View your booking</a></p>
    <p>Questions? Reply to this email or WhatsApp us at ${site.phone}.</p>`);

  await Promise.all([
    sendEmail(b.contactEmail, `${waitlist ? "Waitlist" : "Booking confirmed"}: ${b.tripName} — ${b.bookingCode}`, html),
    sendEmail(
      process.env.TEAM_EMAIL || "",
      `New ${waitlist ? "waitlist entry" : "booking"}: ${b.tripName} (${dateRange(b.batchStart, b.batchEnd)}) — ${b.travellersCount} pax`,
      wrap(`<p><b>${b.contactName}</b> (${b.contactPhone}) ${waitlist ? "joined the waitlist" : `paid ${inr(b.amountPaid)}`}.</p><table>${row("Booking ID", b.bookingCode)}${row("Trip", b.tripName)}${row("Date", dateRange(b.batchStart, b.batchEnd))}${row("Pickup", b.pickup)}${row("Travellers", String(b.travellersCount))}${row("Total", inr(b.totalAmount))}</table><p><a href="${url}/admin/bookings">Open admin</a></p>`),
    ),
    // Template must be approved in WhatsApp Manager with 4 variables: name, trip, date, booking ID
    !waitlist
      ? sendWhatsAppTemplate(b.contactPhone, process.env.WHATSAPP_BOOKING_TEMPLATE || "booking_confirmation", [
          b.contactName,
          b.tripName,
          dateRange(b.batchStart, b.batchEnd),
          b.bookingCode,
        ])
      : Promise.resolve(),
  ]);
}

export async function notifyNewEnquiry(e: Enquiry) {
  const details = [
    ["Name", e.name],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Group size", e.groupSize ? String(e.groupSize) : ""],
    ["Trip type", e.tripType],
    ["Destination", e.destination],
    ["Dates", e.preferredDates],
    ["Budget", e.budget],
    ["Message", e.message],
  ].filter(([, v]) => v);
  await sendEmail(
    process.env.TEAM_EMAIL || "",
    `New ${e.type === "custom" ? "custom trip enquiry" : "contact message"} from ${e.name}`,
    wrap(`<table>${details.map(([k, v]) => row(k, v)).join("")}</table><p><a href="${site.url}/admin/enquiries">Open admin</a></p>`),
  );
}
