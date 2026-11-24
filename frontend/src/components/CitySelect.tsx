"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  hasFreeShipping,
  SHIPPING_OTHER,
  suggestCities,
  type ShippingCity,
} from "@/lib/shipping";

type Props = {
  cities: ShippingCity[];
  loading?: boolean;
  selectedId: number | null;
  onSelect: (city: ShippingCity | null) => void;
};

export function CitySelect({ cities, loading, selectedId, onSelect }: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () => cities.find((c) => c.id === selectedId) ?? null,
    [cities, selectedId],
  );

  const suggestions = useMemo(
    () => suggestCities(cities, query, query.trim() ? 80 : 120),
    [cities, query],
  );

  useEffect(() => {
    if (selected && !open) setQuery(selected.name);
  }, [selected, open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  function pick(city: ShippingCity) {
    onSelect(city);
    setQuery(city.name);
    setOpen(false);
  }

  function openPanel() {
    setOpen(true);
    if (selected) setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = suggestions[activeIndex];
      if (hit) pick(hit);
    } else if (e.key === "Escape") {
      setOpen(false);
      if (selected) setQuery(selected.name);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading cities…</p>;
  }

  if (!cities.length) {
    return (
      <p className="border border-[var(--border)] px-3 py-2 text-sm text-red-400">
        Cities could not load. Refresh the page.
      </p>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Closed / selected trigger — Flaship style */}
      {!open ? (
        <button
          type="button"
          onClick={openPanel}
          className="input-field flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={false}
          aria-haspopup="listbox"
        >
          <span className={selected ? "text-[var(--fg)]" : "text-[var(--muted)]"}>
            {selected ? selected.name : "Select your city"}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-[var(--muted)]"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="overflow-hidden border border-[var(--gold)]/45 bg-[var(--surface)] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                if (
                  selected &&
                  next.trim().toLowerCase() !== selected.name.toLowerCase()
                ) {
                  onSelect(null);
                }
              }}
              onKeyDown={onKeyDown}
              placeholder="Search..."
              className="w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]/60"
              autoComplete="off"
            />
          </div>

          <div id={listId} role="listbox" className="max-h-56 overflow-y-auto">
            {suggestions.map((c, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={selectedId === c.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(c)}
                  className={`block w-full px-3 py-2.5 text-left text-sm transition ${
                    active || selectedId === c.id
                      ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)]"
                      : "hover:bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]"
                  }`}
                >
                  <span className="text-[var(--fg)]">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Keep form validation when closed without selection */}
      <input
        tabIndex={-1}
        className="sr-only"
        required={!selected}
        value={selected?.name ?? ""}
        onChange={() => {}}
        aria-hidden
      />

      {selected && !open ? (
        <p className="mt-1.5 text-[11px] text-[var(--muted)]">
          Selected: <strong className="text-[var(--fg)]">{selected.name}</strong>
          {hasFreeShipping(selected)
            ? " · free delivery"
            : ` · Rs. ${SHIPPING_OTHER} shipping`}
        </p>
      ) : null}
    </div>
  );
}
