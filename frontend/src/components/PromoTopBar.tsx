"use client";

import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useCountdown } from "@/hooks/useCountdown";

export function PromoTopBar() {
  const { ended, ready } = useCountdown();

  if (ready && ended) return null;

  return (
    <div className="relative z-[60] border-b border-[var(--gold)]/25 bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 12%, transparent), transparent)",
        }}
      />
      {/* Mobile: stacked compact · Desktop: single row */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-2 py-2 sm:flex-row sm:justify-between sm:gap-4 sm:px-4 sm:py-2.5 lg:px-8">
        <p className="text-center text-[9px] leading-tight tracking-[0.16em] text-[var(--gold)] uppercase sm:text-[11px] sm:tracking-[0.2em]">
          <span className="sm:hidden">White Friday &amp; NYE · Ends 31 Dec</span>
          <span className="hidden sm:inline">White Friday &amp; New Year · Ends 31 Dec</span>
        </p>
        <CountdownTimer size="sm" />
        <Link
          href="/shop"
          className="min-h-8 px-2 text-[9px] leading-8 tracking-[0.16em] text-[var(--fg)]/85 underline-offset-2 transition hover:text-[var(--gold)] hover:underline uppercase sm:min-h-0 sm:px-0 sm:text-[11px] sm:leading-normal sm:tracking-[0.18em]"
        >
          Shop now
        </Link>
      </div>
    </div>
  );
}
