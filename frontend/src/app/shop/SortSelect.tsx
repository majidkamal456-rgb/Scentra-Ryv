"use client";

import { useRouter } from "next/navigation";

export function SortSelect({ gender, sort }: { gender: string; sort: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-[11px] uppercase tracking-[0.2em] text-brand-mute">
        Sort
      </label>
      <select
        id="sort"
        name="sort"
        value={sort}
        onChange={(e) => {
          const sp = new URLSearchParams();
          if (gender) sp.set("gender", gender);
          sp.set("sort", e.target.value);
          router.push(`/shop?${sp.toString()}`);
        }}
        className="form-input w-auto py-2! text-sm"
      >
        <option value="name">Name</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
