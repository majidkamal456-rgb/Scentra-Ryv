"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export function ProductDetailClient({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const images = [
    ...(product.image_main ? [product.image_main] : []),
    ...(product.images?.map((i) => i.image) || []),
  ];
  const [active, setActive] = useState(0);

  return (
    <section className="page-shell">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden border border-brand-gold/15 bg-brand-ink">
          <div className="relative aspect-square">
            {images[active] ? (
              <Image src={images[active]} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-3xl text-brand-gold/40">
                {product.name}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-brand-gold/10 p-3">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden border ${i === active ? "border-brand-gold" : "border-brand-gold/20"}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:py-4">
          <p className="section-eyebrow">{product.gender}</p>
          <h1 className="mt-3 font-serif text-4xl text-brand-cream md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-brand-mute">{product.short_description}</p>
          <p className="mt-6 font-serif text-3xl text-brand-gold">{formatPrice(product.price)}</p>
          <p className="mt-2 text-sm text-brand-mute">{product.size_ml} · {product.in_stock ? "In stock" : "Out of stock"}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center border border-brand-gold/25">
              <button type="button" className="px-3 py-2 text-brand-gold" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="min-w-10 text-center font-serif text-xl">{qty}</span>
              <button type="button" className="px-3 py-2 text-brand-gold" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button
              type="button"
              className="btn-gold-filled"
              disabled={!product.in_stock}
              onClick={() => add(product, qty)}
            >
              Add to Cart
            </button>
          </div>

          <div className="mt-10 space-y-4 border-t border-brand-gold/10 pt-8 text-sm leading-relaxed text-brand-cream/75">
            <p>{product.description}</p>
            <p><span className="text-brand-gold">Top:</span> {product.top_notes}</p>
            <p><span className="text-brand-gold">Heart:</span> {product.heart_notes}</p>
            <p><span className="text-brand-gold">Base:</span> {product.base_notes}</p>
          </div>
        </div>
      </div>

      {product.related && product.related.length > 0 && (
        <div className="mt-20">
          <div className="text-center">
            <p className="section-eyebrow">More</p>
            <h2 className="section-heading mt-3">You May Also Like</h2>
            <div className="gold-divider" />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.related.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/shop" className="btn-gold">Back to Shop</Link>
          </div>
        </div>
      )}
    </section>
  );
}
