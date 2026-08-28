"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, subtotal, update, remove } = useCart();

  if (items.length === 0) {
    return (
      <section className="page-shell text-center">
        <p className="section-eyebrow">Bag</p>
        <h1 className="section-heading mt-3">Your Cart</h1>
        <div className="gold-divider" />
        <p className="mt-6 text-brand-mute">Your cart is empty.</p>
        <Link href="/shop" className="btn-gold-filled mt-8 inline-block">Shop Collection</Link>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-eyebrow">Bag</p>
        <h1 className="section-heading mt-3">Your Cart</h1>
        <div className="gold-divider" />
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-5 border border-brand-gold/10 bg-brand-charcoal/60 p-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-brand-ink">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.slug}`} className="font-serif text-xl text-brand-cream hover:text-brand-gold">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-brand-mute">{item.size}</p>
              <p className="mt-2 text-brand-gold">{formatPrice(item.price)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center border border-brand-gold/25">
                  <button type="button" className="px-3 py-1 text-brand-gold" onClick={() => update(item.productId, item.size, item.quantity - 1)}>−</button>
                  <span className="min-w-8 text-center">{item.quantity}</span>
                  <button type="button" className="px-3 py-1 text-brand-gold" onClick={() => update(item.productId, item.size, item.quantity + 1)}>+</button>
                </div>
                <button type="button" className="text-xs uppercase tracking-wider text-brand-mute hover:text-red-300" onClick={() => remove(item.productId, item.size)}>
                  Remove
                </button>
              </div>
            </div>
            <p className="font-serif text-lg text-brand-cream">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}

        <div className="surface mt-8 p-6 sm:p-8">
          <div className="flex justify-between text-sm text-brand-mute">
            <span>Subtotal</span>
            <span className="text-brand-cream">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs text-brand-mute">Shipping calculated at checkout (Punjab Rs. 280 · Sindh/Balochistan/KPK Rs. 350).</p>
          <Link href="/checkout" className="btn-gold-filled mt-6 inline-flex w-full justify-center">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
