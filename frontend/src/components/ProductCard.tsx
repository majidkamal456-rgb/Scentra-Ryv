"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";

function truncateWords(text: string, words: number) {
  const parts = (text || "").split(/\s+/).filter(Boolean);
  if (parts.length <= words) return text;
  return parts.slice(0, words).join(" ") + " …";
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { showToast } = useToast();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  function onAdd() {
    if (!product.in_stock || state !== "idle") return;
    setState("adding");
    timers.current.push(
      window.setTimeout(() => {
        add(product, 1, product.size_ml);
        showToast(`${product.name} added to cart`);
        setState("added");
        timers.current.push(window.setTimeout(() => setState("idle"), 1400));
      }, 250),
    );
  }

  return (
    <article className="product-card group">
      <Link href={`/product/${product.slug}`} className="product-card__link">
        <span className="product-card__media">
          {product.image_main ? (
            // Native img keeps the same contain-fit behaviour as the Django card.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_main} alt={product.name} loading="lazy" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-charcoal via-brand-black to-brand-ink">
              <span className="text-center">
                <span className="mx-auto mb-3 block h-24 w-14 rounded-t-full border border-brand-gold/40 bg-gradient-to-b from-brand-gold/30 to-transparent" />
                <span className="font-serif text-lg text-brand-gold/60">{product.name}</span>
              </span>
            </span>
          )}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/35 via-transparent to-transparent" />
          <span className="product-card__badge">{product.gender}</span>
        </span>
        <span className="product-card__body">
          <span className="font-serif text-lg text-brand-cream transition group-hover:text-brand-gold">{product.name}</span>
          <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-mute">
            {truncateWords(product.short_description, 10)}
          </span>
          <span className="mt-auto pt-2 font-serif text-lg text-brand-gold">{formatPrice(product.price)}</span>
        </span>
      </Link>

      <div className="product-card__cart">
        <button
          type="button"
          className={`product-card__cart-btn ${state === "adding" ? "is-adding" : ""} ${state === "added" ? "is-added" : ""}`}
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.in_stock}
          onClick={onAdd}
        >
          <svg className="product-card__cart-icon product-card__cart-icon--bag" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <svg className="product-card__cart-icon product-card__cart-icon--check" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
