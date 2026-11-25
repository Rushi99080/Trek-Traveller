"use client";

import { useEffect } from "react";
import { track } from "./track";

export default function TrackView({ name, id, value }: { name: string; id: string; value: number }) {
  useEffect(() => {
    track("ViewContent", { content_name: name, content_ids: [id], content_type: "product", value });
  }, [name, id, value]);
  return null;
}
