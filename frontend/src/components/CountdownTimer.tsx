"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { pad2 } from "@/lib/countdown";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function CountdownTimer({ size = "md", className = "" }: Props) {
  const { days, hours, minutes, seconds, ended, ready } = useCountdown();

  const box =
    size === "sm"
      ? "min-w-[2rem] px-1 py-0.5 text-xs sm:min-w-[2.4rem] sm:px-1.5 sm:py-1 sm:text-sm"
      : size === "lg"
        ? "min-w-[3.1rem] px-2 py-2 text-xl sm:min-w-[4rem] sm:px-3 sm:py-3 sm:text-2xl md:min-w-[4.5rem] md:text-3xl"
        : "min-w-[2.75rem] px-1.5 py-1.5 text-base sm:min-w-[3.25rem] sm:px-2 sm:py-2 sm:text-lg md:text-xl";

  const labelCls =
    size === "sm"
      ? "text-[7px] mt-0.5 sm:text-[8px]"
      : size === "lg"
        ? "text-[8px] mt-1 sm:text-[10px] sm:mt-1.5"
        : "text-[8px] mt-1 sm:text-[9px]";

  const colonCls =
    size === "sm" ? "text-xs sm:text-sm" : size === "lg" ? "text-lg sm:text-2xl" : "text-base sm:text-lg";

  const units = [
    { label: "Days", value: ready ? days : 0 },
    { label: "Hrs", value: ready ? hours : 0 },
    { label: "Min", value: ready ? minutes : 0 },
    { label: "Sec", value: ready ? seconds : 0 },
  ];

  if (ready && ended) {
    return (
      <p className={`tracking-[0.2em] text-[var(--gold)] uppercase ${className}`}>
        Offer ended
      </p>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}
      aria-live="polite"
      suppressHydrationWarning
    >
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1 sm:gap-2">
          <div className="text-center">
            <div
              className={`font-serif border border-[var(--gold)]/40 bg-black/40 text-[var(--gold)] tabular-nums ${box} ${
                ready ? "" : "opacity-40"
              }`}
              suppressHydrationWarning
            >
              {u.label === "Days" ? u.value : pad2(u.value)}
            </div>
            <p className={`tracking-[0.14em] text-[var(--muted)] uppercase ${labelCls}`}>{u.label}</p>
          </div>
          {i < units.length - 1 ? (
            <span className={`pb-3 font-serif text-[var(--gold)]/70 sm:pb-4 ${colonCls}`}>:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
