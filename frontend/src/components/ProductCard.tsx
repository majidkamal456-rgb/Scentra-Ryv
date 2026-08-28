"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-brand-ink">
        {product.image_main ? (
          <Image
            src={product.image_main}
            alt={product.name}
            fill
            className="object-cover transition duration-1000 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-2xl text-brand-gold/40">
            {product.name}
          </div>
        )}
        <span className="absolute left-3 top-3 border border-brand-gold/30 bg-brand-black/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-brand-gold backdrop-blur-md">
          {product.size_ml}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-xl text-brand-cream hover:text-brand-gold">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-brand-mute">{product.short_description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="font-serif text-lg text-brand-gold">{formatPrice(product.price)}</p>
          <button
            type="button"
            className="btn-gold !px-4 !py-2"
            onClick={() => add(product, 1)}
            disabled={!product.in_stock}
          >
            {product.in_stock ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}
