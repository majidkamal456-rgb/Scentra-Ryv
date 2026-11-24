"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrderTracking, type ApiTracking } from "@/lib/api";

type Props = {
  orderNumber: string;
  trackingNumber?: string | null;
  courierCode?: string | null;
  initialStatus?: string | null;
};

export function OrderTracking({
  orderNumber,
  trackingNumber,
  courierCode,
  initialStatus,
}: Props) {
  const [data, setData] = useState<ApiTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchOrderTracking(orderNumber);
      setData(res);
      if (!res.success) setError(res.message || "Tracking unavailable");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tracking");
    } finally {
      setLoading(false);
    }
  }, [orderNumber, trackingNumber]);

  useEffect(() => {
    load();
  }, [load]);

  if (!trackingNumber) return null;

  const events = [...(data?.tracking ?? [])].reverse();
  const statusLabel =
    data?.live_courier_status || data?.status || initialStatus || "Booked";

  return (
    <div className="mt-8 border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[var(--gold)] uppercase">
            Live tracking
          </p>
          <p className="mt-1 font-serif text-lg text-[var(--fg)]">
            {courierCode ? courierCode.toUpperCase() : "Courier"} · {trackingNumber}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{statusLabel}</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="shrink-0 text-[10px] tracking-[0.14em] text-[var(--gold)] uppercase underline-offset-2 hover:underline disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

      {events.length > 0 ? (
        <ol className="mt-5 space-y-3 border-l border-[var(--gold)]/35 pl-4">
          {events.map((ev, i) => (
            <li key={`${ev.status}-${ev.time}-${i}`} className="relative">
              <span className="absolute top-1.5 -left-[1.3rem] h-2 w-2 rounded-full bg-[var(--gold)]" />
              <p className="text-sm text-[var(--fg)]">{ev.status.replaceAll("_", " ")}</p>
              <p className="text-[11px] text-[var(--muted)]">{ev.time}</p>
            </li>
          ))}
        </ol>
      ) : !loading && !error ? (
        <p className="mt-4 text-xs text-[var(--muted)]">No tracking events yet.</p>
      ) : null}
    </div>
  );
}
