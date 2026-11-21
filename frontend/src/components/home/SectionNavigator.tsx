"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "fragrances", label: "Fragrances" },
  { id: "collection", label: "Collection" },
  { id: "why", label: "Why us" },
  { id: "reviews", label: "Reviews" },
  { id: "delivery", label: "Delivery" },
] as const;

const IDLE_MS = 3000;

export function SectionNavigator() {
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [idleHidden, setIdleHidden] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current !== null) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => {
      setIdleHidden(true);
    }, IDLE_MS);
  }, [clearIdleTimer]);

  const bumpActivity = useCallback(() => {
    setIdleHidden(false);
    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    lastY.current = window.scrollY;

    const updateSection = () => {
      const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
        Boolean,
      ) as HTMLElement[];

      const y = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      els.forEach((el, i) => {
        if (el.offsetTop <= y) idx = i;
      });
      setActive(idx);

      const nearEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;
      setAtEnd(nearEnd || idx >= SECTIONS.length - 1);
    };

    const onScroll = () => {
      const y = window.scrollY;
      // ignore tiny jitters (mobile browser chrome)
      if (Math.abs(y - lastY.current) < 2) {
        updateSection();
        return;
      }
      lastY.current = y;
      updateSection();
      bumpActivity();
    };

    const onWheel = () => bumpActivity();
    const onTouch = () => bumpActivity();
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "PageDown" ||
        e.key === "PageUp" ||
        e.key === " "
      ) {
        bumpActivity();
      }
    };

    updateSection();
    // start 7s countdown immediately on load
    startIdleTimer();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", updateSection);

    return () => {
      clearIdleTimer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", updateSection);
    };
  }, [bumpActivity, clearIdleTimer, startIdleTimer]);

  const remaining = SECTIONS.slice(active + 1);
  const next = remaining[0];
  const visible = !atEnd && !idleHidden && Boolean(next);

  function goTo(id: string) {
    bumpActivity();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <AnimatePresence>
      {visible && next && (
        <motion.div
          key="section-liquid"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-4 md:bottom-7"
        >
          <button
            type="button"
            onClick={() => goTo(next.id)}
            className="pointer-events-auto group relative max-w-[min(92vw,26rem)] overflow-hidden rounded-full border border-white/15 px-1 py-1 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition hover:border-[var(--gold)]/40"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--bg) 55%, transparent), color-mix(in srgb, var(--gold) 12%, transparent) 45%, color-mix(in srgb, var(--bg) 50%, transparent))",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(120% 80% at 10% 0%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(80% 60% at 90% 100%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 50%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[220%]"
            />

            <span className="relative flex items-center gap-3 rounded-full px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-black shadow-[0_0_20px_color-mix(in_srgb,var(--gold)_45%,transparent)]">
                <svg
                  className="h-4 w-4 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.25}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>

              <span className="min-w-0 text-left">
                <span className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-[var(--muted)] uppercase">
                  <span>Coming up</span>
                  <span className="h-px w-4 bg-[var(--gold)]/40" />
                  <span className="text-[var(--gold)]">{remaining.length} left</span>
                </span>
                <span className="font-serif mt-0.5 block truncate text-base text-[var(--fg)] sm:text-lg">
                  {next.label}
                </span>
              </span>

              <span className="hidden items-center gap-1.5 sm:flex">
                {remaining.slice(1, 4).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] tracking-[0.12em] text-[var(--muted)] uppercase backdrop-blur-sm"
                  >
                    {s.label}
                  </span>
                ))}
                {remaining.length > 4 && (
                  <span className="text-[10px] text-[var(--muted)]">+{remaining.length - 4}</span>
                )}
              </span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
