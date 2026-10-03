"use client";

import Link from "next/link";
import { formatPrice, type SiteConfig } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { QtyStepper } from "@/components/QtyStepper";

export function CartClient({ config }: { config: SiteConfig }) {
  const { ready, items, subtotal, count, update, remove } = useCart();

  const nearby = parseFloat(config.shipping_nearby_rate);
  const remote = parseFloat(config.shipping_other_rate);
  const shippingFrom = count > 0 ? nearby : 0;
  const shippingTo = count > 0 ? remote : 0;
  const remoteLabels = (config.remote_city_labels || []).join(", ");

  return (
    <section className="page-shell">
      <div className="page-hero fade-section visible">
        <p className="section-eyebrow">Bag</p>
        <h1 className="section-heading mt-3">Your Cart</h1>
        <div className="gold-divider" />
      </div>

      {!ready ? (
        <div className="py-20" aria-busy="true" />
      ) : items.length > 0 ? (
        <div className="mt-4 grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-line">
                <Link href={`/product/${item.slug}`} className="h-28 w-20 shrink-0 overflow-hidden bg-brand-ink">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-serif text-xl text-brand-cream">
                      <Link href={`/product/${item.slug}`} className="transition hover:text-brand-gold">{item.name}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-brand-mute">
                      {item.size} · {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <QtyStepper
                      value={item.quantity}
                      max={Math.max(1, item.stock)}
                      onChange={(q) => update(item.productId, item.size, q)}
                    />
                    <p className="min-w-[5.5rem] text-right font-serif text-lg text-brand-gold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(item.productId, item.size)}
                      className="flex h-9 w-9 items-center justify-center text-brand-mute transition hover:text-red-400"
                      aria-label="Remove item"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="surface-elevated h-fit p-7 lg:sticky lg:top-28 lg:p-8">
            <h2 className="font-serif text-2xl text-brand-gold">Order Summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-brand-cream/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-cream/70">
                <span>Shipping</span>
                <span>
                  {formatPrice(shippingFrom)} – {Math.round(shippingTo).toLocaleString("en-PK")}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-brand-mute">
                Punjab: {formatPrice(nearby)}. Sindh, Balochistan &amp; KPK
                {remoteLabels ? ` (e.g. ${remoteLabels})` : ""}: {formatPrice(remote)}.
              </p>
              <div className="gold-divider my-5!" />
              <div className="flex justify-between font-serif text-xl text-brand-gold">
                <span>Total</span>
                <span>
                  {formatPrice(subtotal + shippingFrom)} – {Math.round(subtotal + shippingTo).toLocaleString("en-PK")}
                </span>
              </div>
            </div>
            <Link href="/checkout" className="btn-gold-filled mt-8 block w-full text-center">Proceed to Checkout</Link>
            <Link href="/" className="btn-ghost mt-4 block text-center">Continue Shopping</Link>
          </aside>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-brand-mute">Your cart is empty.</p>
          <Link href="/" className="btn-gold mt-8 inline-block">Continue Shopping</Link>
        </div>
      )}
    </section>
  );
}
