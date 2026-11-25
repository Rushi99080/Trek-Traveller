/** Distances and directions from Pune, for the radar map */
export const PUNE = { lat: 18.5204, lng: 73.8567 };

/** Straight-line distance in km and compass bearing in degrees (0 = north) */
export function fromPune(lat: number, lng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat - PUNE.lat);
  const dLng = toRad(lng - PUNE.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(PUNE.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  const y = Math.sin(dLng) * Math.cos(toRad(lat));
  const x = Math.cos(toRad(PUNE.lat)) * Math.sin(toRad(lat)) - Math.sin(toRad(PUNE.lat)) * Math.cos(toRad(lat)) * Math.cos(dLng);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return { km: Math.round(km), bearing };
}

export function compass(bearing: number) {
  const dirs = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return dirs[Math.round(bearing / 45) % 8];
}

/** Parse a pickup time like "9:30 pm" or "11:30 pm (previous night)" */
export function parsePickup(text: string | undefined) {
  const m = text?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "pm") h += 12;
  return { h, m: Number(m[2] ?? 0), previousNight: /previous night/i.test(text ?? "") };
}

/** Departure moment in India time for a batch start date + pickup time */
export function departureTime(startDate: string, pickupText: string | undefined) {
  const p = parsePickup(pickupText) ?? { h: 6, m: 0, previousNight: false };
  const d = new Date(`${startDate}T${String(p.h).padStart(2, "0")}:${String(p.m).padStart(2, "0")}:00+05:30`);
  if (p.previousNight) d.setDate(d.getDate() - 1);
  return d;
}
