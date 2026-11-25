import { NextResponse } from "next/server";
import { getCoupon } from "@/lib/data";
import { couponError } from "@/lib/pricing";

export async function POST(req: Request) {
  const { code, tripSlug, count } = await req.json().catch(() => ({}));
  const coupon = await getCoupon(String(code || ""));
  if (!coupon) return NextResponse.json({ ok: false, error: "That coupon code isn't valid." });
  const err = couponError(coupon, String(tripSlug || ""), Number(count) || 1);
  if (err) return NextResponse.json({ ok: false, error: err });
  return NextResponse.json({ ok: true, coupon });
}
