"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { products, type Gender } from "@/data/products";

const FILTERS: { id: "all" | Gender; label: string }[] = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
];

export default function ShopPage() {
  const [filter, setFilter] = useState<"all" | Gender>("all");

  const list = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.gender === filter)),
    [filter],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 lg:px-8">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Shop</p>
      <h1 className="font-serif mt-2 text-4xl md:text-6xl">The collection</h1>
      <p className="mt-3 max-w-lg text-[var(--muted)]">
        Six signatures — filter by gender and find your next everyday luxury.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition ${
              filter === f.id
                ? "bg-[var(--gold)] text-black"
                : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-3 md:gap-x-8">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
