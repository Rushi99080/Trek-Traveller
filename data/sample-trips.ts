/**
 * SAMPLE TRIPS (demo data)
 * Used only until Supabase is connected. After that, trips are
 * managed from the Admin panel (/admin). The seed file
 * supabase/seed.sql loads these same trips into your database.
 */
import { toISODate } from "@/lib/format";
import type { Batch, Leader, Trip } from "@/lib/types";

// ---------- date helpers so demo dates are always upcoming ----------
const DOW = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 } as const;
type Day = keyof typeof DOW;

/** Date of the given weekday, `weeksAhead` weeks from now (0 = this coming one) */
function upcoming(day: Day, weeksAhead: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (DOW[day] - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff + weeksAhead * 7);
  return d;
}
function plusDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function batch(
  tripId: string,
  n: number,
  start: Date,
  days: number,
  totalSeats: number,
  seatsBooked: number,
  leaderIds: string[] = ["leader-1"],
  status: Batch["status"] = "open",
): Batch {
  return {
    id: `${tripId}-b${n}`,
    tripId,
    startDate: toISODate(start),
    endDate: toISODate(plusDays(start, days - 1)),
    totalSeats,
    seatsBooked,
    status,
    leaderIds,
    whatsappGroupLink: "",
  };
}

// ---------- reusable lists ----------
const dayTrekCarry = [
  "2 litres of water",
  "Trekking shoes with good grip (no sports/running shoes with flat soles)",
  "Small backpack (20–30 L)",
  "Snacks: dry fruits, chikki, energy bars",
  "Cap, sunglasses and sunscreen",
  "Raincoat or poncho (June–September)",
  "Extra pair of clothes and a plastic bag for wet clothes",
  "Original photo ID",
  "Personal medicines",
];

const overnightCarry = [
  ...dayTrekCarry.slice(0, 5),
  "Torch or headlamp with extra batteries",
  "Light jacket or fleece (it gets cold at night)",
  "Sleeping mat or light sleeping bag (if not renting)",
  "Original photo ID",
  "Personal medicines",
];

const standardExclusions = [
  "Anything not mentioned in inclusions",
  "Personal expenses: snacks, drinks, tips",
  "Food on the way during travel",
  "Costs due to bad weather, road blocks or other events outside our control",
];

const defaultFaqs = [
  {
    q: "Can I join this trip alone?",
    a: "Yes. Most of our groups have several solo travellers. You'll be added to the trip WhatsApp group a few days before departure so you can say hello before you meet.",
  },
  {
    q: "Is it safe for women travellers?",
    a: "Yes. Our groups usually include women travellers and we try to have at least one woman coordinator on every trip. Stays are arranged with separate sharing for women on request.",
  },
  {
    q: "What happens if the trip is cancelled due to weather?",
    a: "If we cancel a trip for safety reasons, you can move to another date or get a full credit for a future trip.",
  },
];

// ---------- leaders (placeholders — replace in Admin) ----------
export const sampleLeaders: Leader[] = [
  {
    id: "leader-1",
    name: "[Trek leader name]",
    phone: "",
    photo: "",
    experience: "[e.g. 8 years, 300+ treks led]",
    bio: "[Add 1–2 lines: certifications such as Wilderness First Responder or Basic Mountaineering Course, favourite trek, languages spoken.]",
  },
  {
    id: "leader-2",
    name: "[Trek leader name]",
    phone: "",
    photo: "",
    experience: "[e.g. 5 years, 150+ treks led]",
    bio: "[Add 1–2 lines about this leader.]",
  },
  {
    id: "leader-3",
    name: "[Himalayan trek lead name]",
    phone: "",
    photo: "",
    experience: "[e.g. 10 Himalayan seasons]",
    bio: "[Add 1–2 lines about this leader.]",
  },
];

// ---------- trips ----------
export function getSampleTrips(): Trip[] {
  return [
    {
      id: "rajgad",
      slug: "rajgad-fort-trek",
      name: "Rajgad Fort Trek",
      location: "Gunjavane, near Pune",
      region: "Sahyadri – Pune",
      categories: ["weekend-treks", "fort-treks"],
      durationDays: 1,
      durationLabel: "1 day",
      difficulty: "Moderate",
      altitude: "1,376 m",
      distance: "About 10 km round trip",
      bestSeason: "June to February",
      shortDescription:
        "Climb to the fort that was Chhatrapati Shivaji Maharaj's capital for 26 years, with views of Torna across the valley.",
      overview:
        "Rajgad is one of the largest and best-preserved forts in the Sahyadris. We climb from Gunjavane village through forest and open ridges to Padmavati machi, explore Suvela and Sanjeevani machis, and look across to Torna fort on a clear day.\n\nThe trail has a few steep rock patches with railings, so it's a good next step after your first easy trek.",
      highlights: [
        "Padmavati lake and temple",
        "Balekilla — the fort's highest point",
        "Sanjeevani and Suvela machis with their double walls",
        "Views of Torna fort across the valley",
      ],
      itinerary: [
        {
          label: "Day 1",
          title: "Pune → Rajgad → Pune",
          points: [
            "5:30 am – Pickup from Pune",
            "8:00 am – Breakfast at Gunjavane village, introductions and safety briefing",
            "8:45 am – Start the climb (2.5–3 hours)",
            "12:00 pm – Explore Padmavati machi and Balekilla",
            "2:00 pm – Start descent",
            "4:30 pm – Late lunch in the village",
            "8:30 pm – Drop back in Pune",
          ],
        },
      ],
      inclusions: [
        "Travel by tempo traveller from the chosen pickup point",
        "Breakfast and lunch (vegetarian)",
        "Experienced trek leaders",
        "First aid kit",
        "Forest and entry fees",
      ],
      exclusions: standardExclusions,
      thingsToCarry: dayTrekCarry,
      fitness:
        "You should be able to walk 8–10 km and climb stairs for 30 minutes without stopping. Some short rock patches need using your hands.",
      meetingPoints: [
        { city: "Pune", place: "[Pickup spot, e.g. Swargate / Shivajinagar]", time: "5:30 am", mapsUrl: "https://maps.google.com/?q=Swargate+Pune" },
        { city: "Mumbai", place: "[Pickup spot, e.g. Dadar East]", time: "11:30 pm (previous night)", mapsUrl: "https://maps.google.com/?q=Dadar+East" },
        { city: "Base Village", place: "Gunjavane village", time: "8:00 am", mapsUrl: "https://maps.google.com/?q=Gunjavane" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 1199 },
        { pickup: "Mumbai", price: 1699 },
        { pickup: "Base Village", price: 799 },
      ],
      stayOptions: [],
      paymentMode: "full",
      advanceAmount: 0,
      groupDiscount: { minPeople: 5, percent: 5 },
      images: ["/images/trips/rajgad-fort-trek-1.svg", "/images/trips/rajgad-fort-trek-2.svg", "/images/trips/rajgad-fort-trek-3.svg"],
      leaderIds: ["leader-1", "leader-2"],
      faqs: [
        { q: "Is Rajgad OK for a first-time trekker?", a: "If you're reasonably active, yes. The climb is long and has a few rocky patches, so take your time and the leaders will help." },
        ...defaultFaqs,
      ],
      popularity: 95,
      isPublished: true,
      sortOrder: 1,
      batches: [
        batch("rajgad", 1, upcoming("sun", 0), 1, 30, 25),
        batch("rajgad", 2, upcoming("sat", 1), 1, 30, 12),
        batch("rajgad", 3, upcoming("sun", 3), 1, 30, 4),
        batch("rajgad", 4, upcoming("sat", 6), 1, 30, 0),
      ],
    },
    {
      id: "harishchandragad",
      slug: "harishchandragad-trek",
      name: "Harishchandragad Trek",
      location: "Khireshwar, Ahilyanagar district",
      region: "Sahyadri – Malshej",
      categories: ["weekend-treks", "fort-treks"],
      durationDays: 2,
      durationLabel: "2 days / 1 night",
      difficulty: "Moderate",
      altitude: "1,424 m",
      distance: "About 14 km over 2 days",
      bestSeason: "August to February",
      shortDescription:
        "Watch the sunset from Konkan Kada, sleep under the stars on top, and see the ancient Kedareshwar cave temple.",
      overview:
        "Harishchandragad is a Sahyadri favourite for good reason. We climb through Tolar Khind from Khireshwar, camp on top, watch the sunset from the curved cliff of Konkan Kada, and wake up early for sunrise from Taramati peak.\n\nOn the way you'll see the Harishchandreshwar temple, carved from a single rock, and the Kedareshwar cave with its Shivling surrounded by water.",
      highlights: [
        "Sunset from the overhanging cliff of Konkan Kada",
        "Kedareshwar cave temple",
        "Sunrise from Taramati peak",
        "Night under the stars in tents",
      ],
      itinerary: [
        {
          label: "Day 0",
          title: "Overnight travel",
          points: ["11:30 pm – Pickup from Pune / Mumbai", "Overnight drive to Khireshwar village"],
        },
        {
          label: "Day 1",
          title: "Climb and Konkan Kada sunset",
          points: [
            "6:00 am – Reach Khireshwar, freshen up, breakfast",
            "7:30 am – Start the climb via Tolar Khind (4–5 hours)",
            "1:00 pm – Lunch on top, set up tents",
            "Afternoon – Harishchandreshwar temple and Kedareshwar cave",
            "5:30 pm – Sunset at Konkan Kada",
            "8:30 pm – Dinner and stargazing",
          ],
        },
        {
          label: "Day 2",
          title: "Taramati sunrise and descent",
          points: [
            "5:30 am – Climb Taramati peak for sunrise",
            "8:00 am – Breakfast, pack up",
            "9:00 am – Descend to Khireshwar",
            "1:00 pm – Lunch and drive back",
            "8:00 pm – Drop in Pune / Mumbai",
          ],
        },
      ],
      inclusions: [
        "Travel by tempo traveller / bus from the chosen pickup point",
        "Breakfast, lunch and dinner on Day 1; breakfast and lunch on Day 2",
        "Tent stay on top (sharing as selected)",
        "Experienced trek leaders and local guide",
        "First aid kit",
        "Forest and entry fees",
      ],
      exclusions: standardExclusions,
      thingsToCarry: overnightCarry,
      fitness:
        "You should be comfortable walking 5–6 hours with a backpack. Previous trekking experience helps but isn't required.",
      meetingPoints: [
        { city: "Pune", place: "[Pickup spot, e.g. Shivajinagar]", time: "11:30 pm (previous night)" },
        { city: "Mumbai", place: "[Pickup spot, e.g. Kalyan station]", time: "11:59 pm (previous night)" },
        { city: "Base Village", place: "Khireshwar village", time: "6:00 am", mapsUrl: "https://maps.google.com/?q=Khireshwar" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 2299 },
        { pickup: "Mumbai", price: 2499 },
        { pickup: "Base Village", price: 1599 },
      ],
      stayOptions: [
        { name: "Shared tent (3–4 people)", extra: 0 },
        { name: "Twin sharing tent", extra: 400 },
      ],
      paymentMode: "advance",
      advanceAmount: 1000,
      groupDiscount: { minPeople: 5, percent: 5 },
      images: ["/images/trips/harishchandragad-trek-1.svg", "/images/trips/harishchandragad-trek-2.svg", "/images/trips/harishchandragad-trek-3.svg"],
      leaderIds: ["leader-1", "leader-2"],
      faqs: defaultFaqs,
      popularity: 90,
      isPublished: true,
      sortOrder: 2,
      batches: [
        batch("harishchandragad", 1, upcoming("sat", 0), 2, 25, 25, ["leader-1"], "waitlist"),
        batch("harishchandragad", 2, upcoming("sat", 2), 2, 25, 17),
        batch("harishchandragad", 3, upcoming("sat", 5), 2, 25, 3),
      ],
    },
    {
      id: "kalsubai",
      slug: "kalsubai-night-trek",
      name: "Kalsubai Night Trek",
      location: "Bari village, Igatpuri",
      region: "Sahyadri – Nashik",
      categories: ["night-treks", "weekend-treks"],
      durationDays: 2,
      durationLabel: "Overnight",
      difficulty: "Moderate",
      altitude: "1,646 m",
      distance: "About 11 km round trip",
      bestSeason: "October to February",
      shortDescription:
        "Trek through the night to the highest point in Maharashtra and watch the sunrise above the clouds.",
      overview:
        "Kalsubai is the highest peak in Maharashtra. We start from Bari village late at night, climb with headlamps through farms, steps and iron ladders, and reach the summit temple before sunrise.\n\nOn a clear morning you can see Bhandardara lake, Alang–Madan–Kulang and Ratangad from the top.",
      highlights: [
        "Sunrise from Maharashtra's highest peak",
        "Iron ladders on the final section",
        "Kalsubai temple at the summit",
        "Views of Bhandardara lake and the AMK range",
      ],
      itinerary: [
        {
          label: "Night",
          title: "Travel and night climb",
          points: [
            "9:30 pm – Pickup from Pune / Mumbai",
            "1:30 am – Reach Bari village, tea and safety briefing",
            "2:00 am – Start the night climb (3.5–4 hours)",
          ],
        },
        {
          label: "Morning",
          title: "Summit sunrise and return",
          points: [
            "6:15 am – Sunrise at the summit",
            "7:30 am – Start descent",
            "10:00 am – Breakfast in Bari village",
            "2:00 pm – Drop in Pune / Mumbai",
          ],
        },
      ],
      inclusions: [
        "Travel by tempo traveller from the chosen pickup point",
        "Tea on arrival and breakfast after the trek",
        "Experienced trek leaders",
        "First aid kit",
        "Entry fees",
      ],
      exclusions: standardExclusions,
      thingsToCarry: overnightCarry,
      fitness:
        "The climb is steady and long. You should be able to walk uphill for 3–4 hours with short breaks. Not recommended if you have a fear of heights on ladders.",
      meetingPoints: [
        { city: "Pune", place: "[Pickup spot, e.g. Nashik Phata]", time: "9:30 pm" },
        { city: "Mumbai", place: "[Pickup spot, e.g. Thane station]", time: "10:30 pm" },
        { city: "Base Village", place: "Bari village", time: "1:30 am", mapsUrl: "https://maps.google.com/?q=Bari+Kalsubai" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 1499 },
        { pickup: "Mumbai", price: 1399 },
        { pickup: "Base Village", price: 899 },
      ],
      stayOptions: [],
      paymentMode: "full",
      advanceAmount: 0,
      groupDiscount: { minPeople: 5, percent: 5 },
      images: ["/images/trips/kalsubai-night-trek-1.svg", "/images/trips/kalsubai-night-trek-2.svg", "/images/trips/kalsubai-night-trek-3.svg"],
      leaderIds: ["leader-2"],
      faqs: [
        { q: "Is a night trek safe?", a: "Yes, with the right group. Our leaders walk at the front and back, everyone carries a headlamp, and we take a well-used route with regular breaks." },
        ...defaultFaqs,
      ],
      popularity: 88,
      isPublished: true,
      sortOrder: 3,
      batches: [
        batch("kalsubai", 1, upcoming("sat", 0), 2, 35, 31, ["leader-2"]),
        batch("kalsubai", 2, upcoming("sat", 2), 2, 35, 10, ["leader-2"]),
        batch("kalsubai", 3, upcoming("sat", 4), 2, 35, 0, ["leader-2"]),
      ],
    },
    {
      id: "andharban",
      slug: "andharban-jungle-trek",
      name: "Andharban Jungle Trek",
      location: "Pimpri village, Tamhini Ghat",
      region: "Sahyadri – Tamhini",
      categories: ["monsoon-treks", "weekend-treks"],
      durationDays: 1,
      durationLabel: "1 day",
      difficulty: "Easy",
      altitude: "About 650 m",
      distance: "About 13 km (mostly downhill)",
      bestSeason: "June to September (also beautiful till December)",
      shortDescription:
        "A long, gentle walk through thick forest on the edge of the Sahyadris, past streams and waterfalls.",
      overview:
        "Andharban means 'dark forest'. The trail runs from Pimpri village near Tamhini Ghat down to Bhira, through dense forest that stays green and shaded for most of the way.\n\nIt's long but mostly downhill, with valley views, small streams to cross and waterfalls during the monsoon. A great first trek for anyone who can walk comfortably for a few hours.",
      highlights: [
        "Dense forest trail with valley viewpoints",
        "Waterfalls and stream crossings in the monsoon",
        "View of the Kundalika valley",
        "Easy pace, good for first-timers",
      ],
      itinerary: [
        {
          label: "Day 1",
          title: "Pune → Andharban → Pune",
          points: [
            "5:30 am – Pickup from Pune",
            "8:00 am – Breakfast near Tamhini, safety briefing",
            "9:00 am – Start the trail from Pimpri village (5–6 hours)",
            "3:00 pm – Reach Bhira, lunch",
            "4:30 pm – Drive back",
            "8:00 pm – Drop in Pune",
          ],
        },
      ],
      inclusions: [
        "Travel by tempo traveller from the chosen pickup point",
        "Breakfast and lunch (vegetarian)",
        "Experienced trek leaders",
        "First aid kit",
        "Forest permission and entry fees",
      ],
      exclusions: standardExclusions,
      thingsToCarry: dayTrekCarry,
      fitness: "Easy, but long. You should be able to walk 12–13 km at an easy pace.",
      meetingPoints: [
        { city: "Pune", place: "[Pickup spot, e.g. Chandni Chowk]", time: "5:30 am" },
        { city: "Mumbai", place: "[Pickup spot, e.g. Dadar East]", time: "1:30 am" },
        { city: "Base Village", place: "Pimpri village", time: "8:30 am", mapsUrl: "https://maps.google.com/?q=Pimpri+Tamhini" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 1399 },
        { pickup: "Mumbai", price: 1799 },
        { pickup: "Base Village", price: 999 },
      ],
      stayOptions: [],
      paymentMode: "full",
      advanceAmount: 0,
      groupDiscount: { minPeople: 5, percent: 5 },
      images: ["/images/trips/andharban-jungle-trek-1.svg", "/images/trips/andharban-jungle-trek-2.svg", "/images/trips/andharban-jungle-trek-3.svg"],
      leaderIds: ["leader-1"],
      faqs: defaultFaqs,
      popularity: 80,
      isPublished: true,
      sortOrder: 4,
      batches: [
        batch("andharban", 1, upcoming("sun", 1), 1, 30, 9),
        batch("andharban", 2, upcoming("sun", 4), 1, 30, 2),
      ],
    },
    {
      id: "pawna",
      slug: "pawna-lake-camping",
      name: "Pawna Lake Camping",
      location: "Pawna Lake, near Lonavala",
      region: "Sahyadri – Lonavala",
      categories: ["camping", "corporate-trips"],
      durationDays: 2,
      durationLabel: "2 days / 1 night",
      difficulty: "Easy",
      altitude: "About 600 m",
      distance: "No trekking",
      bestSeason: "All year (best October to March)",
      shortDescription:
        "Lakeside tents, a bonfire, barbecue and music, with Tung, Tikona and Lohagad around you.",
      overview:
        "An easy overnight escape for friends, couples, families and teams. We camp on the banks of Pawna Lake with forts on the skyline, light a bonfire, put on some music and have dinner by the water.\n\nWake up to sunrise over the lake and an unhurried breakfast before heading home.",
      highlights: [
        "Lakeside tents",
        "Bonfire, music and barbecue",
        "Views of Tung, Tikona and Lohagad forts",
        "Sunrise over the lake",
      ],
      itinerary: [
        {
          label: "Day 1",
          title: "Arrive and set up camp",
          points: [
            "2:00 pm – Pickup from Pune / Mumbai",
            "5:00 pm – Check in, tea and snacks",
            "6:00 pm – Sunset by the lake, games",
            "7:30 pm – Bonfire, music and barbecue",
            "9:00 pm – Dinner",
          ],
        },
        {
          label: "Day 2",
          title: "Sunrise and head home",
          points: ["6:30 am – Sunrise by the lake", "8:30 am – Breakfast", "10:00 am – Check out and drive back", "1:00 pm – Drop in Pune / Mumbai"],
        },
      ],
      inclusions: [
        "Travel from the chosen pickup point (not for Base Village)",
        "Tent stay with mattresses (sharing as selected)",
        "Evening snacks, barbecue (veg / non-veg), dinner and breakfast",
        "Bonfire and music",
        "Washrooms at the campsite",
        "Camp coordinator",
      ],
      exclusions: standardExclusions,
      thingsToCarry: [
        "Light jacket for the night",
        "Torch",
        "Comfortable shoes or sandals",
        "Toiletries and towel",
        "Original photo ID",
        "Personal medicines",
      ],
      fitness: "No fitness requirement. Suitable for all ages.",
      meetingPoints: [
        { city: "Pune", place: "[Pickup spot, e.g. Wakad Bridge]", time: "2:00 pm" },
        { city: "Mumbai", place: "[Pickup spot, e.g. Vashi]", time: "1:00 pm" },
        { city: "Base Village", place: "Campsite, Pawna Lake", time: "5:00 pm (self-reach)", mapsUrl: "https://maps.google.com/?q=Pawna+Lake" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 1799 },
        { pickup: "Mumbai", price: 2199 },
        { pickup: "Base Village", price: 1299 },
      ],
      stayOptions: [
        { name: "Triple sharing tent", extra: 0 },
        { name: "Twin sharing tent", extra: 300 },
      ],
      paymentMode: "advance",
      advanceAmount: 500,
      groupDiscount: { minPeople: 6, percent: 8 },
      images: ["/images/trips/pawna-lake-camping-1.svg", "/images/trips/pawna-lake-camping-2.svg", "/images/trips/pawna-lake-camping-3.svg"],
      leaderIds: ["leader-2"],
      faqs: [
        { q: "Can we bring kids?", a: "Yes. Kids above 5 years are welcome. Children under 5 come free when sharing a tent with parents." },
        { q: "Can we book the whole campsite for a team?", a: "Yes. Use the Plan a Custom Trip form or message us on WhatsApp for team and corporate bookings." },
        ...defaultFaqs.slice(1),
      ],
      popularity: 92,
      isPublished: true,
      sortOrder: 5,
      batches: [
        batch("pawna", 1, upcoming("sat", 0), 2, 40, 22, ["leader-2"]),
        batch("pawna", 2, upcoming("sat", 1), 2, 40, 15, ["leader-2"]),
        batch("pawna", 3, upcoming("sat", 3), 2, 40, 6, ["leader-2"]),
        batch("pawna", 4, upcoming("sat", 7), 2, 40, 0, ["leader-2"]),
      ],
    },
    {
      id: "hampi",
      slug: "hampi-backpacking-trip",
      name: "Hampi Backpacking Trip",
      location: "Hampi, Karnataka",
      region: "Karnataka",
      categories: ["backpacking"],
      durationDays: 4,
      durationLabel: "4 days / 3 nights",
      difficulty: "Easy",
      altitude: "About 470 m",
      distance: "Walking and cycling, 5–8 km a day",
      bestSeason: "October to February",
      shortDescription:
        "Boulder hills, ruined temples and coracle rides on the Tungabhadra — Hampi at backpacker pace with a fun group.",
      overview:
        "Hampi was the capital of the Vijayanagara Empire, and its ruins are spread across a landscape of giant boulders, banana fields and river. We explore on foot and by bicycle, catch sunrise and sunset from the hills, and cross to the quieter Hampi Island side.\n\nStays are in simple, clean guesthouses, and the group travels together from Pune by overnight sleeper bus.",
      highlights: [
        "Virupaksha temple and Hampi Bazaar",
        "Stone chariot at Vittala temple",
        "Sunset from Hemakuta hill, sunrise from Matanga hill",
        "Coracle ride on the Tungabhadra river",
        "Cycling around Anegundi and Sanapur lake",
      ],
      itinerary: [
        { label: "Day 0", title: "Overnight bus", points: ["7:00 pm – Depart Pune by sleeper bus"] },
        {
          label: "Day 1",
          title: "Hampi Bazaar and Hemakuta sunset",
          points: ["7:00 am – Reach Hampi, check in, breakfast", "Virupaksha temple and Hampi Bazaar", "Evening – Sunset from Hemakuta hill"],
        },
        {
          label: "Day 2",
          title: "Royal ruins by bicycle",
          points: ["Vittala temple and the stone chariot", "Lotus Mahal, Elephant Stables, Queen's Bath", "Coracle ride on the Tungabhadra"],
        },
        {
          label: "Day 3",
          title: "Hampi Island and Anegundi",
          points: ["5:30 am – Sunrise from Matanga hill", "Cross to Hampi Island, cycle to Sanapur lake and Anegundi", "8:00 pm – Board the bus back to Pune"],
        },
        { label: "Day 4", title: "Arrive in Pune", points: ["8:00 am – Reach Pune"] },
      ],
      inclusions: [
        "Sleeper bus from Pune / Mumbai and back (not for Base Village)",
        "3 nights' stay in guesthouses (sharing as selected)",
        "Breakfast and dinner on all days",
        "Bicycle hire for 2 days",
        "Coracle ride",
        "Trip leader throughout",
      ],
      exclusions: [...standardExclusions, "Monument entry tickets (about ₹40 per site)", "Lunch on all days"],
      thingsToCarry: [
        "Backpack (40–50 L)",
        "Comfortable walking shoes and sandals",
        "Cap, sunglasses and sunscreen",
        "Water bottle",
        "Light cotton clothes and one warm layer",
        "Original photo ID",
        "Personal medicines",
      ],
      fitness: "Easy. You'll walk and cycle 5–8 km a day in the sun, with breaks.",
      meetingPoints: [
        { city: "Pune", place: "[Bus pickup, e.g. Swargate]", time: "7:00 pm (Day 0)" },
        { city: "Mumbai", place: "[Bus pickup, e.g. Sion]", time: "3:00 pm (Day 0)" },
        { city: "Base Village", place: "Hampi Bus Stand", time: "8:00 am (Day 1)", mapsUrl: "https://maps.google.com/?q=Hampi+Bus+Stand" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 8999 },
        { pickup: "Mumbai", price: 9499 },
        { pickup: "Base Village", price: 5999 },
      ],
      stayOptions: [
        { name: "Triple sharing room", extra: 0 },
        { name: "Twin sharing room", extra: 1000 },
      ],
      paymentMode: "advance",
      advanceAmount: 3000,
      groupDiscount: { minPeople: 4, percent: 5 },
      images: ["/images/trips/hampi-backpacking-trip-1.svg", "/images/trips/hampi-backpacking-trip-2.svg", "/images/trips/hampi-backpacking-trip-3.svg"],
      leaderIds: ["leader-1"],
      faqs: defaultFaqs,
      popularity: 85,
      isPublished: true,
      sortOrder: 6,
      batches: [
        batch("hampi", 1, upcoming("thu", 1), 4, 20, 8),
        batch("hampi", 2, upcoming("thu", 4), 4, 20, 16),
        batch("hampi", 3, upcoming("thu", 7), 4, 20, 2),
      ],
    },
    {
      id: "gokarna",
      slug: "gokarna-beach-trek",
      name: "Gokarna Beach Trek",
      location: "Gokarna, Karnataka",
      region: "Karnataka",
      categories: ["backpacking"],
      durationDays: 3,
      durationLabel: "3 days / 2 nights",
      difficulty: "Easy",
      altitude: "Sea level",
      distance: "About 9 km beach-to-beach trail",
      bestSeason: "October to March",
      shortDescription:
        "Walk the cliffs from Kudle to Paradise beach, swim, and end each day with a sunset over the Arabian Sea.",
      overview:
        "Gokarna is the relaxed alternative to Goa. The beach trek follows rocky headlands and forest paths from Kudle beach to Om, Half Moon and Paradise beaches, with plenty of time to swim and rest on the way.\n\nWe stay near Kudle beach, so sunsets and evenings by the sea are part of every day.",
      highlights: [
        "Beach trek: Kudle → Om → Half Moon → Paradise",
        "Boat ride back from Paradise beach",
        "Sunsets on Kudle beach",
        "Mahabaleshwar temple and Gokarna town",
      ],
      itinerary: [
        { label: "Day 0", title: "Overnight bus", points: ["6:30 pm – Depart Pune by sleeper bus"] },
        {
          label: "Day 1",
          title: "Arrive and settle in",
          points: ["9:00 am – Reach Gokarna, check in near Kudle beach", "Afternoon – Gokarna town and Mahabaleshwar temple", "Evening – Sunset at Kudle beach"],
        },
        {
          label: "Day 2",
          title: "The beach trek",
          points: ["8:00 am – Start the trail to Om, Half Moon and Paradise beaches", "Swim and relax at Paradise beach", "4:00 pm – Boat back to Gokarna"],
        },
        {
          label: "Day 3",
          title: "Slow morning and head home",
          points: ["Free morning on the beach", "1:00 pm – Check out", "6:00 pm – Board the bus back", "Arrive Pune next morning"],
        },
      ],
      inclusions: [
        "Sleeper bus from Pune / Mumbai and back (not for Base Village)",
        "2 nights' stay in beach huts or guesthouse (sharing as selected)",
        "Breakfast and dinner on all days",
        "Boat ride from Paradise beach",
        "Trip leader throughout",
      ],
      exclusions: [...standardExclusions, "Lunch on all days", "Water sports"],
      thingsToCarry: [
        "Backpack (30–40 L)",
        "Sandals or shoes with grip for rocky sections",
        "Swimwear and quick-dry towel",
        "Cap, sunglasses and sunscreen",
        "Water bottle",
        "Original photo ID",
        "Personal medicines",
      ],
      fitness: "Easy. The beach trail has some rocky climbs, about 4–5 hours with breaks.",
      meetingPoints: [
        { city: "Pune", place: "[Bus pickup, e.g. Swargate]", time: "6:30 pm (Day 0)" },
        { city: "Mumbai", place: "[Bus pickup, e.g. Sion]", time: "3:00 pm (Day 0)" },
        { city: "Base Village", place: "Gokarna Bus Stand", time: "9:00 am (Day 1)", mapsUrl: "https://maps.google.com/?q=Gokarna+Bus+Stand" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 6999 },
        { pickup: "Mumbai", price: 7499 },
        { pickup: "Base Village", price: 4499 },
      ],
      stayOptions: [
        { name: "Triple sharing hut", extra: 0 },
        { name: "Twin sharing hut", extra: 800 },
      ],
      paymentMode: "advance",
      advanceAmount: 2500,
      groupDiscount: { minPeople: 4, percent: 5 },
      images: ["/images/trips/gokarna-beach-trek-1.svg", "/images/trips/gokarna-beach-trek-2.svg", "/images/trips/gokarna-beach-trek-3.svg"],
      leaderIds: ["leader-2"],
      faqs: defaultFaqs,
      popularity: 82,
      isPublished: true,
      sortOrder: 7,
      batches: [
        batch("gokarna", 1, upcoming("fri", 2), 3, 20, 14, ["leader-2"]),
        batch("gokarna", 2, upcoming("fri", 5), 3, 20, 5, ["leader-2"]),
      ],
    },
    {
      id: "kedarkantha",
      slug: "kedarkantha-himalayan-trek",
      name: "Kedarkantha Himalayan Trek",
      location: "Sankri, Uttarakhand",
      region: "Himalayas – Uttarakhand",
      categories: ["himalayan-treks"],
      durationDays: 6,
      durationLabel: "6 days / 5 nights",
      difficulty: "Moderate",
      altitude: "3,800 m (12,500 ft)",
      distance: "About 20 km on trail",
      bestSeason: "December to April (snow trek)",
      shortDescription:
        "The classic first Himalayan snow trek — pine forests, frozen lakes and a summit sunrise above 12,000 ft.",
      overview:
        "Kedarkantha is often the first Himalayan summit for trekkers from Maharashtra. The trail climbs from Sankri village through pine and oak forest to campsites in snowy clearings, with the summit push starting well before dawn.\n\nFrom the top you'll see Swargarohini, Bandarpoonch and Black Peak. Our Himalayan team handles camps, meals and safety, and the group meets in Dehradun.",
      highlights: [
        "Summit sunrise at 3,800 m",
        "Snow campsites at Juda ka Talab and Kedarkantha base",
        "Views of Swargarohini, Bandarpoonch and Black Peak",
        "Sankri village and Govind wildlife area",
      ],
      itinerary: [
        { label: "Day 1", title: "Dehradun → Sankri", points: ["6:30 am – Pickup from Dehradun", "Drive 8–9 hours to Sankri (1,950 m)", "Evening – Briefing and gear check"] },
        { label: "Day 2", title: "Sankri → Juda ka Talab", points: ["Trek 4–5 hours through pine forest", "Camp near the lake (2,700 m)"] },
        { label: "Day 3", title: "Juda ka Talab → Base camp", points: ["Trek 3–4 hours to Kedarkantha base (3,400 m)", "Acclimatisation walk"] },
        { label: "Day 4", title: "Summit day", points: ["3:00 am – Start the summit climb", "Sunrise at the summit (3,800 m)", "Descend to Hargaon camp"] },
        { label: "Day 5", title: "Hargaon → Sankri", points: ["Trek down 3–4 hours", "Celebration dinner in Sankri"] },
        { label: "Day 6", title: "Sankri → Dehradun", points: ["7:00 am – Drive back", "Reach Dehradun by 6:00 pm"] },
      ],
      inclusions: [
        "Pune / Mumbai option: 3AC train tickets to Dehradun and back",
        "Dehradun – Sankri – Dehradun transport",
        "Stay in guesthouse at Sankri and tents on the trek (triple sharing)",
        "All meals from Day 1 dinner to Day 6 breakfast",
        "Certified Himalayan trek leader, guides, cook and support staff",
        "Forest permits and camping fees",
        "Microspikes and gaiters",
        "First aid, oxygen cylinder and oximeter",
      ],
      exclusions: [...standardExclusions, "Porter to carry your backpack (about ₹1,800)", "Travel insurance"],
      thingsToCarry: [
        "Backpack (50–60 L) with rain cover",
        "Trekking shoes with ankle support",
        "3 warm layers including a down/padded jacket",
        "Thermals, woollen cap, gloves and socks",
        "Sunglasses (UV protection)",
        "2 water bottles",
        "Headlamp",
        "Medical certificate (form shared after booking)",
        "Original photo ID",
      ],
      fitness:
        "You should be able to jog 5 km in under 40 minutes before the trek. We'll share a 6-week fitness plan after you book.",
      meetingPoints: [
        { city: "Pune", place: "Pune railway station (train to Dehradun)", time: "[Train time shared after booking]" },
        { city: "Dehradun", place: "Dehradun railway station", time: "6:30 am (Day 1)", mapsUrl: "https://maps.google.com/?q=Dehradun+Railway+Station" },
        { city: "Base Village", place: "Sankri village", time: "5:00 pm (Day 1)", mapsUrl: "https://maps.google.com/?q=Sankri" },
      ],
      pickupPrices: [
        { pickup: "Pune", price: 15999 },
        { pickup: "Dehradun", price: 8999 },
        { pickup: "Base Village", price: 7999 },
      ],
      stayOptions: [],
      paymentMode: "advance",
      advanceAmount: 3000,
      groupDiscount: { minPeople: 4, percent: 5 },
      images: ["/images/trips/kedarkantha-himalayan-trek-1.svg", "/images/trips/kedarkantha-himalayan-trek-2.svg", "/images/trips/kedarkantha-himalayan-trek-3.svg"],
      leaderIds: ["leader-3"],
      faqs: [
        { q: "I've never done a Himalayan trek. Can I do Kedarkantha?", a: "Yes, if you prepare. Many people do Kedarkantha as their first Himalayan trek. Follow the fitness plan we send and you'll enjoy it." },
        { q: "How cold does it get?", a: "Daytime is usually 5–10°C and nights can drop to –5 to –10°C at higher camps. Our tents and sleeping bags are rated for these temperatures." },
        ...defaultFaqs,
      ],
      popularity: 87,
      isPublished: true,
      sortOrder: 8,
      batches: [
        batch("kedarkantha", 1, upcoming("sun", 2), 6, 18, 11, ["leader-3"]),
        batch("kedarkantha", 2, upcoming("fri", 4), 6, 18, 18, ["leader-3"], "waitlist"),
        batch("kedarkantha", 3, upcoming("sun", 7), 6, 18, 6, ["leader-3"]),
      ],
    },
  ];
}
