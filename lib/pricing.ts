import { site } from "@/site.config";
import { priceFor, todayISO } from "./format";
import type { Coupon, Trip } from "./types";

export interface PriceInput {
  trip: Trip;
  pickup: string;
  stayOption?: string;
  count: number;
  coupon?: Coupon | null;
  paymentOption: "full" | "advance";
}

export interface PriceBreakdown {
  perPerson: number;
  stayExtra: number;
  subtotal: number;
  groupDiscount: number;
  couponDiscount: number;
  gst: number;
  taxable: number;
  total: number;
  payNow: number;
  balance: number;
  advanceAvailable: boolean;
}

/**
 * The single place where trip prices are calculated.
 * Used by the booking page (to show the price) and by the server
 * (to charge the correct amount), so they always match.
 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const { trip, pickup, stayOption, coupon, paymentOption } = input;
  const count = Math.max(1, Math.floor(input.count || 1));

  const perPerson = priceFor(trip, pickup);
  const stay = trip.stayOptions.find((s) => s.name === stayOption);
  const stayExtra = stay ? stay.extra : 0;
  const subtotal = (perPerson + stayExtra) * count;

  let groupDiscount = 0;
  if (trip.groupDiscount && count >= trip.groupDiscount.minPeople) {
    groupDiscount = Math.round((subtotal * trip.groupDiscount.percent) / 100);
  }

  let couponDiscount = 0;
  if (coupon && !couponError(coupon, trip.slug, count)) {
    const afterGroup = subtotal - groupDiscount;
    couponDiscount =
      coupon.discountType === "percent"
        ? Math.round((afterGroup * coupon.value) / 100)
        : Math.min(afterGroup, coupon.value);
  }

  let total = Math.max(0, subtotal - groupDiscount - couponDiscount);
  let gst: number;
  let taxable: number;
  if (site.pricesIncludeGst) {
    taxable = Math.round((total / (1 + site.gstRate / 100)) * 100) / 100;
    gst = Math.round((total - taxable) * 100) / 100;
  } else {
    taxable = total;
    gst = Math.round(total * site.gstRate) / 100;
    total = Math.round(total + gst);
  }

  const advanceAvailable = trip.paymentMode === "advance" && trip.advanceAmount > 0;
  const payNow =
    paymentOption === "advance" && advanceAvailable
      ? Math.min(total, trip.advanceAmount * count)
      : total;

  return {
    perPerson,
    stayExtra,
    subtotal,
    groupDiscount,
    couponDiscount,
    gst,
    taxable,
    total,
    payNow,
    balance: total - payNow,
    advanceAvailable,
  };
}

/** Returns a reason the coupon can't be used, or null if it's fine */
export function couponError(coupon: Coupon, tripSlug: string, count: number): string | null {
  if (!coupon.active) return "This coupon is no longer active.";
  if (coupon.validUntil && coupon.validUntil < todayISO()) return "This coupon has expired.";
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
    return "This coupon has been fully used.";
  if (coupon.tripSlugs.length && !coupon.tripSlugs.includes(tripSlug))
    return "This coupon isn't valid for this trip.";
  if (count < coupon.minPeople) return `Add at least ${coupon.minPeople} travellers to use this coupon.`;
  return null;
}
