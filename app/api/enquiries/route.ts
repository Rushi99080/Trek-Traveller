import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/data";
import { notifyNewEnquiry } from "@/lib/notify";

const clean = (s: unknown, max = 300) => String(s ?? "").trim().slice(0, max);

/** Custom trip enquiries and contact form messages */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // spam trap

  const name = clean(b.name, 100);
  const phone = clean(b.phone, 20);
  if (!name || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please add your name and a 10-digit phone number." }, { status: 400 });
  }
  try {
    const enquiry = await createEnquiry({
      type: b.type === "contact" ? "contact" : "custom",
      name,
      phone,
      email: clean(b.email, 120),
      groupSize: Number(b.groupSize) || null,
      destination: clean(b.destination),
      preferredDates: clean(b.preferredDates),
      budget: clean(b.budget, 60),
      tripType: clean(b.tripType, 40),
      message: clean(b.message, 2000),
    });
    await notifyNewEnquiry(enquiry);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Couldn't send right now. Please WhatsApp us instead." }, { status: 500 });
  }
}
