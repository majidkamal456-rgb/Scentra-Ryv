"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchReviews, getHomeReviews, type Review } from "@/data/reviews";

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="w-[min(85vw,22rem)] shrink-0 select-none border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-3 text-[var(--gold)]" aria-label={`${review.rating} stars`}>
        {"★".repeat(review.rating)}
        <span className="text-[var(--muted)]">{"★".repeat(5 - review.rating)}</span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        &ldquo;{review.comment}&rdquo;
      </p>
      {review.productName ? (
        <p className="mt-3 text-[10px] tracking-[0.16em] text-[var(--gold)]/70 uppercase">
          on {review.productName}
        </p>
      ) : null}
      <p className="font-serif mt-3 text-lg">{review.name}</p>
      {review.city ? (
        <p className="text-xs tracking-wider text-[var(--gold)] uppercase">{review.city}</p>
      ) : null}
    </article>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(() => getHomeReviews());
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchReviews().then((list) => {
      if (!cancelled) setReviews(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);

    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    return () => {
      el.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, [updateNav, reviews]);

  function scrollByCard(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("article");
    const amount = (card?.clientWidth ?? 320) + 20;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function scrollToIndex(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
    el.classList.add("cursor-grabbing");
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    drag.current.active = false;
    el?.classList.remove("cursor-grabbing");
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  if (reviews.length === 0) return null;

  return (
    <section className="relative z-10 overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Voices</p>
        <h2 className="font-serif mt-2 text-3xl md:text-5xl">What Our Clients Say</h2>
        <div className="gold-rule mt-4 max-w-xs" />
      </div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 md:w-24">
          <div
            className="absolute inset-0 backdrop-blur-[2px]"
            style={{
              maskImage: "linear-gradient(to right, black 35%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black 35%, transparent)",
              background:
                "linear-gradient(to right, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 55%, transparent 100%)",
            }}
          />
          <button
            type="button"
            aria-label="Previous reviews"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
            className="pointer-events-auto absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[color-mix(in_srgb,var(--bg)_65%,transparent)] text-[var(--gold)] shadow-lg backdrop-blur-md transition hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-black disabled:pointer-events-none disabled:opacity-0 md:left-3 md:h-12 md:w-12"
          >
            <ArrowIcon dir="left" />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 md:w-24">
          <div
            className="absolute inset-0 backdrop-blur-[2px]"
            style={{
              maskImage: "linear-gradient(to left, black 35%, transparent)",
              WebkitMaskImage: "linear-gradient(to left, black 35%, transparent)",
              background:
                "linear-gradient(to left, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 55%, transparent 100%)",
            }}
          />
          <button
            type="button"
            aria-label="Next reviews"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
            className="pointer-events-auto absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[color-mix(in_srgb,var(--bg)_65%,transparent)] text-[var(--gold)] shadow-lg backdrop-blur-md transition hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-black disabled:pointer-events-none disabled:opacity-0 md:right-3 md:h-12 md:w-12"
          >
            <ArrowIcon dir="right" />
          </button>
        </div>

        <div
          ref={trackRef}
          className="flex cursor-grab gap-5 overflow-x-auto scroll-smooth px-10 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing md:px-14 [&::-webkit-scrollbar]:hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Review slides">
        {reviews.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-label={`Go to review ${i + 1}`}
            aria-selected={active === i}
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all ${
              active === i
                ? "w-6 bg-[var(--gold)]"
                : "w-2 bg-[var(--border)] hover:bg-[var(--gold)]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
