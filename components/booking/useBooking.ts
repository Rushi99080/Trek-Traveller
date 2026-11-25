"use client";

import { useEffect, useState } from "react";
import type { Booking, MeetingPoint } from "@/lib/types";

export type BookingPayload = { booking: Booking; trip: { meetingPoints: MeetingPoint[] }; groupLink: string };

/** Loads a booking: first from this browser (right after paying), then from the server */
export function useBooking(id: string | null) {
  const [data, setData] = useState<BookingPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!id) {
      setState("missing");
      return;
    }
    let cancelled = false;
    let local: BookingPayload | null = null;
    try {
      local = JSON.parse(sessionStorage.getItem(`booking:${id}`) || "null");
    } catch {}
    if (local) {
      setData(local);
      setState("ready");
    }
    fetch(`/api/bookings/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.booking) {
          setData(d);
          setState("ready");
        } else if (!local) setState("missing");
      })
      .catch(() => {
        if (!cancelled && !local) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, state };
}
