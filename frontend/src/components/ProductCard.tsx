"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, genderLabel, type Product } from "@/data/products";
import { fetchProductMeta } from "@/data/productMeta";
import { flyToCart } from "@/lib/flyToCart";
import { useCart } from "@/store/cart";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add);
  const imgWrapRef = useRef<HTMLAnchorElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [avg, setAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchProductMeta().then((meta) => {
      if (cancelled) return;
      const m = meta[product.slug];
      if (m) {
        setAvg(m.averageRating);
        setReviewCount(m.reviewCount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  function handleBuy() {
    flyToCart(imgWrapRef.current ?? btnRef.current, product.image);
    add(product);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <Link
        ref={imgWrapRef}
        href={`/product/${product.slug}`}
        className="relative block aspect-[6/5] w-full overflow-hidden sm:aspect-[5/5]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <span className="absolute top-2.5 left-2.5 z-10 max-w-[calc(100%-1.25rem)] bg-[var(--gold)] px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-black uppercase shadow-sm sm:top-3 sm:left-3 sm:px-2.5 sm:text-[10px]">
          Free tester
        </span>
      </Link>

      <div className="relative z-10 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-3.5 sm:px-4 sm:py-4">
        <p className="text-[9px] tracking-[0.2em] text-[var(--gold)] uppercase">
          {genderLabel(product.gender)}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="font-serif mt-1 block text-base leading-tight tracking-wide md:text-lg"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--muted)]">
          {reviewCount > 0 ? (
            <>
              <span className="text-[var(--gold)]" aria-label={`${avg.toFixed(1)} stars`}>
                {"★".repeat(Math.min(5, Math.round(avg)))}
              </span>
              <span>
                {avg.toFixed(1)} · {reviewCount} reviews
              </span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>

        <p className="mt-2 text-[10px] tracking-[0.08em] text-[var(--gold)]/90 uppercase sm:text-[11px]">
          Buy 1 · get free tester
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--gold)] md:text-base">
            {formatPrice(product.price)}
          </p>
          <button
            ref={btnRef}
            type="button"
            className="rounded-full bg-[var(--gold)] px-4 py-2 text-[10px] font-medium tracking-[0.12em] text-black uppercase transition hover:brightness-110 active:scale-95"
            onClick={handleBuy}
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}
