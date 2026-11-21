"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import { useCart, useCartHydrated } from "@/store/cart";

export default function CartPage() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal);
  const safeItems = hydrated ? items : [];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-20 lg:px-8">
      <h1 className="font-serif text-4xl md:text-5xl">Your cart</h1>

      {!hydrated ? (
        <p className="mt-16 text-center text-[var(--muted)]">Loading cart…</p>
      ) : safeItems.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-[var(--muted)]">Your cart is empty.</p>
          <Link href="/shop" className="btn-gold mt-8 inline-flex">
            Shop collection
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-[var(--border)]">
            {safeItems.map((item) => (
              <li key={item.productId} className="flex gap-4 py-6">
                <div className="relative h-28 w-20 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="80px" />
                </div>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/product/${item.slug}`} className="font-serif text-xl hover:text-[var(--gold)]">
                      {item.name}
                    </Link>
                    <p className="text-sm text-[var(--muted)]">{item.sizeMl}</p>
                    <p className="mt-1 text-[var(--gold)]">{formatPrice(item.price)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-4 sm:mt-0">
                    <div className="flex items-center border border-[var(--border)]">
                      <button type="button" className="px-3 py-1" onClick={() => update(item.productId, item.quantity - 1)}>
                        −
                      </button>
                      <span className="min-w-8 text-center">{item.quantity}</span>
                      <button type="button" className="px-3 py-1" onClick={() => update(item.productId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="text-xs text-[var(--muted)] underline hover:text-[var(--gold)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-end gap-4 border-t border-[var(--border)] pt-6">
            <p className="text-lg">
              Subtotal{" "}
              <span className="font-serif text-2xl text-[var(--gold)]">{formatPrice(subtotal())}</span>
            </p>
            <p className="text-xs text-[var(--muted)]">Shipping calculated at checkout · Cash on Delivery</p>
            <Link href="/checkout" className="btn-gold">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
