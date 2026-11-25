"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Win = Window & { gtag?: (...a: any[]) => void; fbq?: (...a: any[]) => void };

/**
 * Sends an event to Google Analytics and Meta Pixel (if they're set up).
 * Meta standard events used: ViewContent, Lead, InitiateCheckout, Purchase.
 */
export function track(event: "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase" | "Contact", params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const gaNames: Record<string, string> = {
    ViewContent: "view_item",
    Lead: "generate_lead",
    InitiateCheckout: "begin_checkout",
    Purchase: "purchase",
    Contact: "contact",
  };
  try {
    w.gtag?.("event", gaNames[event], { currency: "INR", ...params });
    w.fbq?.("track", event, { currency: "INR", ...params });
  } catch {
    // analytics should never break the page
  }
}
