export type Difficulty = "Easy" | "Moderate" | "Difficult";

export type CategorySlug =
  | "weekend-treks"
  | "night-treks"
  | "monsoon-treks"
  | "fort-treks"
  | "camping"
  | "backpacking"
  | "himalayan-treks"
  | "international-tours"
  | "corporate-trips";

/** What the admin sets on a batch */
export type BatchStatus = "open" | "filling_fast" | "waitlist" | "sold_out" | "closed";

/** What visitors see */
export type DisplayStatus = "Open" | "Filling Fast" | "Waitlist" | "Sold Out";

export interface ItineraryDay {
  label: string; // e.g. "Day 1", "Night", "Day 0"
  title: string;
  points: string[];
}

export interface MeetingPoint {
  city: string; // matches a pickup price, e.g. "Pune"
  place: string;
  time: string;
  mapsUrl?: string;
}

export interface PickupPrice {
  pickup: string; // "Pune", "Mumbai", "Base Village"
  price: number; // per person, ₹
}

export interface StayOption {
  name: string; // "Triple sharing tent"
  extra: number; // ₹ added per person (0 for the default option)
}

export interface Faq {
  q: string;
  a: string;
}

export interface Leader {
  id: string;
  name: string;
  phone?: string;
  photo?: string;
  bio?: string;
  experience?: string;
}

export interface Batch {
  id: string;
  tripId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalSeats: number;
  seatsBooked: number;
  status: BatchStatus;
  leaderIds: string[];
  whatsappGroupLink?: string;
}

export interface Trip {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  /** Map position (used for the "How far is your weekend?" radar) */
  latitude: number | null;
  longitude: number | null;
  categories: CategorySlug[];
  durationDays: number;
  durationLabel: string;
  difficulty: Difficulty;
  altitude: string;
  distance: string;
  bestSeason: string;
  shortDescription: string;
  overview: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  fitness: string;
  meetingPoints: MeetingPoint[];
  pickupPrices: PickupPrice[];
  stayOptions: StayOption[];
  paymentMode: "full" | "advance"; // advance = traveller may pay a part now
  advanceAmount: number; // per person, ₹
  groupDiscount: { minPeople: number; percent: number } | null;
  images: string[];
  leaderIds: string[];
  faqs: Faq[];
  popularity: number;
  isPublished: boolean;
  sortOrder: number;
  batches: Batch[];
}

export interface Traveller {
  name: string;
  age: number | "";
  gender: "Male" | "Female" | "Other" | "";
  phone: string;
  email: string;
  emergencyName: string;
  emergencyPhone: string;
  idType: string;
  medicalNotes: string;
}

export type BookingStatus = "pending" | "confirmed" | "waitlist" | "cancelled";
export type PaymentStatus = "pending" | "advance" | "paid" | "refunded" | "failed";

export interface Booking {
  id: string;
  bookingCode: string;
  tripId: string;
  batchId: string;
  tripName: string;
  tripSlug: string;
  batchStart: string;
  batchEnd: string;
  pickup: string;
  stayOption: string;
  travellersCount: number;
  travellers: Traveller[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  perPerson: number;
  baseAmount: number;
  groupDiscount: number;
  couponCode: string;
  couponDiscount: number;
  totalAmount: number;
  paymentOption: "full" | "advance";
  amountDueNow: number;
  amountPaid: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  isDemo: boolean;
  notes?: string;
  createdAt: string;
}

export type EnquiryStatus = "new" | "contacted" | "quoted" | "confirmed" | "lost";

export interface Enquiry {
  id: string;
  type: "custom" | "contact";
  name: string;
  phone: string;
  email: string;
  groupSize: number | null;
  destination: string;
  preferredDates: string;
  budget: string;
  tripType: string;
  message: string;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percent" | "flat";
  value: number;
  minPeople: number;
  maxUses: number | null;
  usedCount: number;
  validUntil: string | null;
  tripSlugs: string[];
  active: boolean;
}
