/**
 * WEBSITE TEXT CONTENT
 * Edit the text here to change what appears on the homepage and
 * across the site. Keep the quotes " " around each piece of text.
 */
import type { CategorySlug, Coupon } from "@/lib/types";

export const categories: { slug: CategorySlug; label: string; blurb: string; image: string }[] = [
  { slug: "weekend-treks", label: "Weekend Treks", blurb: "Back by Sunday night", image: "/images/trips/rajgad-fort-trek-2.svg" },
  { slug: "night-treks", label: "Night Treks", blurb: "Climb by headlamp, summit at sunrise", image: "/images/trips/kalsubai-night-trek-1.svg" },
  { slug: "monsoon-treks", label: "Monsoon & Waterfall Treks", blurb: "Green trails, June to September", image: "/images/trips/andharban-jungle-trek-1.svg" },
  { slug: "fort-treks", label: "Fort Treks", blurb: "Sahyadri forts and their stories", image: "/images/trips/rajgad-fort-trek-1.svg" },
  { slug: "camping", label: "Camping", blurb: "Lakes, bonfires, starry skies", image: "/images/trips/pawna-lake-camping-1.svg" },
  { slug: "backpacking", label: "Backpacking Trips", blurb: "Hampi, Gokarna and beyond", image: "/images/trips/hampi-backpacking-trip-1.svg" },
  { slug: "himalayan-treks", label: "Himalayan Treks", blurb: "Snow summits and high camps", image: "/images/trips/kedarkantha-himalayan-trek-1.svg" },
  { slug: "international-tours", label: "International Tours", blurb: "Group trips abroad", image: "/images/trips/international-1.svg" },
  { slug: "corporate-trips", label: "Corporate Trips", blurb: "Offsites and team outings", image: "/images/trips/pawna-lake-camping-2.svg" },
];

export function categoryLabel(slug: string) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}

export const hero = {
  headline: "Come solo. Leave with a crew.",
  subheadline:
    "Weekend treks, night treks and lakeside camps from Pune & Mumbai — trek leaders, transport and food sorted.",
};

export const whyUs = [
  { icon: "Compass", title: "Experienced trek leaders", text: "Every group is led by leaders who know the trail, the weather and the villages along the way." },
  { icon: "ShieldPlus", title: "First aid and safety", text: "First aid kit on every trip, briefing before every climb, and a leader at the front and back." },
  { icon: "Users", title: "Women-friendly groups", text: "Women travellers in most groups, separate sharing on request, and women coordinators on many trips." },
  { icon: "Bus", title: "Transport from Pune & Mumbai", text: "Pick-up points across both cities. Or meet us at the base village and pay less." },
  { icon: "BadgeIndianRupee", title: "All-inclusive pricing", text: "Travel, meals, fees and leaders are in the price. No surprise costs on the trail." },
] as const;

export const soloSteps = [
  { title: "Book your seat", text: "Pick a trip and date. You don't need a group — most of our travellers come solo." },
  { title: "Join the trip group", text: "A few days before, we add you to the trip's WhatsApp group with the leader and other travellers." },
  { title: "Meet at pickup", text: "Your leader introduces everyone at the pickup point. By breakfast, you'll know half the bus." },
];

export const homeFaqs = [
  { q: "I've never trekked before. Where should I start?", a: "Start with an Easy trek like Andharban or Pawna Lake Camping, then try a Moderate fort trek like Rajgad. Each trip page lists the fitness you need." },
  { q: "Can I join a trip alone?", a: "Yes — most of our travellers join solo. You'll be added to the trip WhatsApp group before departure so you can get to know the group." },
  { q: "What's included in the price?", a: "Usually travel from your pickup point, meals during the trip, entry and forest fees, and trek leaders. Each trip page lists exactly what's included and what isn't." },
  { q: "How do I pay?", a: "Online by UPI, debit or credit card, or net banking through Razorpay. For longer trips you can pay an advance now and the rest before departure." },
  { q: "What if I need to cancel?", a: "See our Cancellation & Refund policy. The earlier you cancel, the more you get back, and you can often move to another date instead." },
  { q: "Do you organise trips for companies and colleges?", a: "Yes. Use Plan a Custom Trip and tell us your group size, dates and budget. We'll send a plan and quote." },
];

/**
 * REVIEWS — placeholders.
 * Replace these with real reviews from your travellers (e.g. copy from
 * your Google reviews). Don't publish made-up reviews.
 */
export const reviews = [
  { name: "[Traveller name]", trip: "Rajgad Fort Trek", rating: 5, text: "[Paste a real review from one of your travellers here.]" },
  { name: "[Traveller name]", trip: "Kalsubai Night Trek", rating: 5, text: "[Paste a real review from one of your travellers here.]" },
  { name: "[Traveller name]", trip: "Pawna Lake Camping", rating: 5, text: "[Paste a real review from one of your travellers here.]" },
  { name: "[Traveller name]", trip: "Kedarkantha Himalayan Trek", rating: 5, text: "[Paste a real review from one of your travellers here.]" },
];

/** Instagram strip on the homepage — replace with your own photos */
export const instagramTiles = [
  "/images/trips/rajgad-fort-trek-3.svg",
  "/images/trips/kalsubai-night-trek-2.svg",
  "/images/trips/pawna-lake-camping-3.svg",
  "/images/trips/kedarkantha-himalayan-trek-2.svg",
  "/images/trips/gokarna-beach-trek-1.svg",
  "/images/trips/andharban-jungle-trek-2.svg",
];

/**
 * CANCELLATION & REFUND POLICY — placeholder terms.
 * Review with your CA / lawyer and edit before going live.
 * Shown on every trip page and on the Policies page.
 */
export const cancellationPolicy = [
  "More than 15 days before departure: full refund minus ₹200 processing fee, or a 100% credit note for a future trip.",
  "7 to 15 days before departure: 50% refund, or a 100% credit note for a future trip.",
  "Less than 7 days before departure: no refund. A 50% credit note may be given at our discretion.",
  "Advance payments are non-refundable but can be moved to another date once.",
  "If we cancel a trip due to weather or safety reasons, you can choose another date or get a full credit note.",
  "Refunds are processed to the original payment method within 7–10 working days.",
];

/** Demo coupons — used only until Supabase is connected */
export const sampleCoupons: Coupon[] = [
  {
    code: "FIRSTTREK",
    description: "10% off your first trip",
    discountType: "percent",
    value: 10,
    minPeople: 1,
    maxUses: null,
    usedCount: 0,
    validUntil: null,
    tripSlugs: [],
    active: true,
  },
  {
    code: "SQUAD500",
    description: "₹500 off when 4 or more book together",
    discountType: "flat",
    value: 500,
    minPeople: 4,
    maxUses: null,
    usedCount: 0,
    validUntil: null,
    tripSlugs: [],
    active: true,
  },
];

export const idTypes = ["Aadhaar card", "PAN card", "Driving licence", "Passport", "Voter ID", "College ID"];
