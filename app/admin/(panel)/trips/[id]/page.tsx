import { notFound } from "next/navigation";
import { getLeaders, getTripById, isSupabaseConfigured } from "@/lib/data";
import TripEditor from "@/components/admin/TripEditor";
import type { Trip } from "@/lib/types";

const blank: Trip = {
  id: "",
  slug: "",
  name: "",
  location: "",
  region: "",
  categories: ["weekend-treks"],
  durationDays: 1,
  durationLabel: "1 day",
  difficulty: "Easy",
  altitude: "",
  distance: "",
  bestSeason: "",
  shortDescription: "",
  overview: "",
  highlights: [],
  itinerary: [{ label: "Day 1", title: "", points: [] }],
  inclusions: [],
  exclusions: [],
  thingsToCarry: [],
  fitness: "",
  meetingPoints: [
    { city: "Pune", place: "", time: "", mapsUrl: "" },
    { city: "Mumbai", place: "", time: "", mapsUrl: "" },
  ],
  pickupPrices: [
    { pickup: "Pune", price: 0 },
    { pickup: "Mumbai", price: 0 },
    { pickup: "Base Village", price: 0 },
  ],
  stayOptions: [],
  paymentMode: "full",
  advanceAmount: 0,
  groupDiscount: null,
  images: [],
  leaderIds: [],
  faqs: [],
  popularity: 50,
  isPublished: true,
  sortOrder: 100,
  batches: [],
};

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, leaders] = await Promise.all([id === "new" ? Promise.resolve(blank) : getTripById(id), getLeaders()]);
  if (!trip) notFound();
  return <TripEditor initial={trip} leaders={leaders} canUpload={isSupabaseConfigured()} />;
}
