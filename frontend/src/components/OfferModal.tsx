"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useCountdown } from "@/hooks/useCountdown";

export function OfferModal() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const { ended, ready } = useCountdown();

  useEffect(() => {
    if (!onHome || !ready || ended) {
      setOpen(false);
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [onHome, ready, ended]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  if (!open || !onHome || !ready || ended) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="White Friday offer — free delivery until 25 December"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close offer"
        onClick={close}
      />

      {/* Mobile: bottom sheet · Desktop: centered card */}
      <div
        className="relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden border border-[var(--gold)]/40 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:max-h-[90vh] rounded-t-2xl sm:rounded-none"
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-2 right-2 z-20 flex h-11 w-11 items-center justify-center text-[var(--muted)] transition hover:text-[var(--gold)] sm:top-3 sm:right-3 sm:h-9 sm:w-9"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* drag hint on mobile */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-[var(--gold)]/35" />
        </div>

        <div className="relative overflow-y-auto overscroll-contain px-4 pb-6 pt-4 text-center sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in srgb, var(--gold) 16%, transparent), transparent 70%)",
            }}
          />
          <p className="relative text-[9px] tracking-[0.28em] text-[var(--gold)] uppercase sm:text-[10px] sm:tracking-[0.32em]">
            Limited season
          </p>
          <h2 className="font-serif relative mt-2 text-[1.65rem] leading-tight text-[var(--fg)] sm:mt-3 sm:text-4xl">
            White Friday
          </h2>
          <p className="relative mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--muted)] sm:mt-3 sm:text-sm">
            Free delivery on Leopard-mapped cities · Rs. 200 elsewhere + free tester — ends 25
            December.
          </p>

          <div className="relative mt-5 sm:mt-8">
            <CountdownTimer size="lg" />
          </div>

          <div className="relative mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              onClick={close}
              className="btn-gold min-h-11 w-full touch-manipulation sm:min-h-0 sm:w-auto"
            >
              Shop the sale
            </Link>
            <button
              type="button"
              onClick={close}
              className="btn-outline min-h-11 w-full touch-manipulation sm:min-h-0 sm:w-auto"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
