// Builds supabase/seed.sql from the sample trips in data/sample-trips.ts
// Run: npm run make-seed
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { getSampleTrips, sampleLeaders } from "../data/sample-trips";
import { sampleCoupons } from "../data/content";

const q = (v: unknown) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const arr = (v: string[], type = "text") => `array[${v.map(q).join(",")}]::${type}[]`;

const leaderMap = new Map<string, string>();
let sql = `-- Sample data: 8 trips with upcoming batches, 3 placeholder leaders, 2 coupons.\n-- Run AFTER schema.sql. Safe to run once; running again adds duplicates of leaders.\n\n`;

for (const l of sampleLeaders) {
  const id = randomUUID();
  leaderMap.set(l.id, id);
  sql += `insert into leaders (id, name, phone, photo, bio, experience) values (${q(id)}, ${q(l.name)}, ${q(l.phone)}, ${q(l.photo)}, ${q(l.bio)}, ${q(l.experience)});\n`;
}
sql += "\n";

for (const t of getSampleTrips()) {
  const id = randomUUID();
  const leaders = t.leaderIds.map((x) => leaderMap.get(x)!).filter(Boolean);
  sql += `insert into trips (id, slug, name, location, region, latitude, longitude, categories, duration_days, duration_label, difficulty, altitude, distance, best_season, short_description, overview, highlights, itinerary, inclusions, exclusions, things_to_carry, fitness, meeting_points, pickup_prices, stay_options, payment_mode, advance_amount, group_discount, images, leader_ids, faqs, popularity, is_published, sort_order) values (
  ${q(id)}, ${q(t.slug)}, ${q(t.name)}, ${q(t.location)}, ${q(t.region)}, ${q(t.latitude)}, ${q(t.longitude)}, ${arr(t.categories)}, ${t.durationDays}, ${q(t.durationLabel)}, ${q(t.difficulty)}, ${q(t.altitude)}, ${q(t.distance)}, ${q(t.bestSeason)}, ${q(t.shortDescription)}, ${q(t.overview)},
  ${json(t.highlights)}, ${json(t.itinerary)}, ${json(t.inclusions)}, ${json(t.exclusions)}, ${json(t.thingsToCarry)}, ${q(t.fitness)}, ${json(t.meetingPoints)}, ${json(t.pickupPrices)}, ${json(t.stayOptions)},
  ${q(t.paymentMode)}, ${t.advanceAmount}, ${t.groupDiscount ? json(t.groupDiscount) : "null"}, ${json(t.images)}, ${arr(leaders, "uuid")}, ${json(t.faqs)}, ${t.popularity}, true, ${t.sortOrder}
) on conflict (slug) do nothing;\n`;
  for (const b of t.batches) {
    const bl = b.leaderIds.map((x) => leaderMap.get(x)!).filter(Boolean);
    sql += `insert into batches (trip_id, start_date, end_date, total_seats, seats_booked, status, leader_ids) select id, ${q(b.startDate)}, ${q(b.endDate)}, ${b.totalSeats}, ${b.seatsBooked}, ${q(b.status)}, ${arr(bl, "uuid")} from trips where slug = ${q(t.slug)};\n`;
  }
  sql += "\n";
}

for (const c of sampleCoupons) {
  sql += `insert into coupons (code, description, discount_type, value, min_people, max_uses, valid_until, trip_slugs, active) values (${q(c.code)}, ${q(c.description)}, ${q(c.discountType)}, ${c.value}, ${c.minPeople}, ${q(c.maxUses)}, ${q(c.validUntil)}, ${arr(c.tripSlugs)}, true) on conflict (code) do nothing;\n`;
}

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("Wrote supabase/seed.sql");
