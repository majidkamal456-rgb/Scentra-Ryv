"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatPrice,
  genderLabel,
  products,
  type Product,
} from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { fetchReviews, getReviewsForProduct, type Review } from "@/data/reviews";
import { flyToCart } from "@/lib/flyToCart";
import { useCart } from "@/store/cart";

export function ProductDetailClient({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const imgRef = useRef<HTMLDivElement>(null);
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  const [productReviews, setProductReviews] = useState<Review[]>(() =>
    getReviewsForProduct(product.slug),
  );

  useEffect(() => {
    let cancelled = false;
    fetchReviews(product.slug).then((list) => {
      if (!cancelled) setProductReviews(list);
    });
    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div ref={imgRef} className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">
            {genderLabel(product.gender)} · {product.sizeMl}
          </p>
          <h1 className="font-serif mt-2 text-4xl md:text-6xl">{product.name}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Inspired by {product.inspiredBy}</p>
          <p className="font-serif mt-4 text-3xl text-[var(--gold)]">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">{product.description}</p>

          <div className="mt-8 space-y-4">
            <NoteRow label="Top" notes={product.topNotes} />
            <NoteRow label="Heart" notes={product.heartNotes} />
            <NoteRow label="Base" notes={product.baseNotes} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-[var(--border)]">
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-10 text-center">{qty}</span>
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                flyToCart(imgRef.current, product.image);
                add(product, qty);
              }}
            >
              Add to cart
            </button>
          </div>
          <p className="mt-4 text-xs tracking-wider text-[var(--muted)] uppercase">
            Cash on Delivery · Nationwide shipping
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Reviews</h2>
        {productReviews.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No reviews yet for this fragrance.</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {productReviews.map((r) => (
              <article key={r.id} className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-[var(--gold)]">{"★".repeat(r.rating)}</p>
                <p className="mt-3 text-sm text-[var(--muted)]">&ldquo;{r.comment}&rdquo;</p>
                <p className="font-serif mt-4">{r.name}</p>
                <p className="text-xs text-[var(--gold)] uppercase">{r.city}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl">You may also like</h2>
          <Link href="/shop" className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-8">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NoteRow({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-[var(--gold)] uppercase">{label} notes</p>
      <p className="mt-1 text-sm text-[var(--fg)]">{notes.join(" · ")}</p>
    </div>
  );
}
