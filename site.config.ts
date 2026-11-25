/**
 * ============================================================
 *  SITE SETTINGS — edit this one file to update your details
 * ============================================================
 * Anything in [SQUARE BRACKETS] is a placeholder. Replace it
 * with your real details before going live.
 * After editing, save the file — the website updates itself.
 */

export const site = {
  // ---------- Company ----------
  name: "[COMPANY NAME]",
  shortName: "[COMPANY]",
  tagline: "Group treks and trips from Pune & Mumbai",
  description:
    "Weekend treks, night treks, monsoon waterfall trails, fort treks, camping, backpacking, Himalayan treks and international tours from Pune and Mumbai. Join solo or bring your group.",

  // Your live website address (no slash at the end), e.g. "https://www.yourcompany.com"
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Logo: put your logo file in /public (e.g. /public/logo.png) and write "/logo.png" here.
  // Leave empty ("") to show the company name as text.
  logo: "",

  // ---------- Contact ----------
  phone: "+91 [90000 00000]",
  // WhatsApp number: digits only, with country code 91 (no + or spaces)
  whatsappNumber: "919000000000",
  whatsappDefaultMessage: "Hi! I want to know more about your upcoming trips.",
  email: "[hello@yourcompany.com]",
  address: "[Office address line], Pune, Maharashtra [411001]",
  // Paste a Google Maps link to your office
  mapsLink: "https://maps.google.com/?q=Pune",
  // Text used to show the map on the Contact page
  mapEmbedQuery: "Pune, Maharashtra",
  officeHours: "Mon–Sat, 10 am – 7 pm",

  // ---------- Social & community ----------
  instagram: "https://instagram.com/[yourhandle]",
  instagramHandle: "@[yourhandle]",
  youtube: "https://youtube.com/@[yourchannel]",
  facebook: "https://facebook.com/[yourpage]",
  whatsappCommunity: "https://chat.whatsapp.com/[your-invite-code]",

  // ---------- Billing / GST invoice ----------
  legalName: "[Registered business name]",
  gstin: "[GSTIN]",
  pan: "[PAN]",
  stateName: "Maharashtra",
  stateCode: "27",
  // Tour operator GST rate in % (check with your CA)
  gstRate: 5,
  // true = your trip prices already include GST (invoice shows the tax split inside the price)
  pricesIncludeGst: true,
  // Prefix for booking IDs, e.g. TRK-8K2M4Q
  bookingPrefix: "TRK",

  // ---------- Homepage numbers (replace with your real numbers) ----------
  stats: [
    { value: 350, suffix: "+", label: "Trips completed" },
    { value: 9000, suffix: "+", label: "Happy travellers" },
    { value: 60, suffix: "+", label: "Destinations" },
    { value: 4.8, suffix: "/5", label: "Google rating", decimals: 1 },
  ],

  // Cities we pick up from (used in filters)
  pickupCities: ["Pune", "Mumbai", "Base Village"],
};

export type SiteConfig = typeof site;

/** WhatsApp click-to-chat link with an optional pre-filled message */
export function whatsappLink(message?: string, number: string = site.whatsappNumber) {
  const text = encodeURIComponent(message ?? site.whatsappDefaultMessage);
  return `https://wa.me/${number}?text=${text}`;
}
