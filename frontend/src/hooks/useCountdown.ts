"use client";

import { useEffect, useState } from "react";
import { CAMPAIGN_END, getCountdownParts, type CountdownParts } from "@/lib/countdown";

const EMPTY: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ended: false,
};

/** Client-only countdown — avoids SSR/hydration time mismatch. */
export function useCountdown(end: Date = CAMPAIGN_END) {
  const [parts, setParts] = useState<CountdownParts>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(new Date(), end));
    tick();
    setReady(true);
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [end]);

  return { ...parts, ready };
}
