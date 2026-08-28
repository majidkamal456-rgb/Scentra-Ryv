"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchConfig, formatPrice, submitCheckout, type SiteConfig } from "@/lib/api";
import { useCart } from "@/lib/cart";

const REMOTE = new Set([
  "karachi", "hyderabad", "sukkur", "quetta", "peshawar", "mardan", "abbottabad", "swat",
]);

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [city, setCity] = useState("");
  const [payment, setPayment] = useState<"cod" | "bank_transfer">("cod");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  const shipping = useMemo(() => {
    if (!config) return 0;
    const nearby = parseFloat(config.shipping_nearby_rate);
    const remote = parseFloat(config.shipping_other_rate);
    const norm = city.trim().toLowerCase();
    if (!norm) return nearby;
    if (REMOTE.has(norm) || [...REMOTE].some((r) => norm.includes(r))) return remote;
    return nearby;
  }, [city, config]);

  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="page-shell text-center">
        <h1 className="section-heading">Checkout</h1>
        <p className="mt-4 text-brand-mute">Your cart is empty.</p>
        <Link href="/shop" className="btn-gold mt-8 inline-block">Shop</Link>
      </section>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("payment_method", payment);
    fd.set(
      "items",
      JSON.stringify(
        items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          size: i.size,
        })),
      ),
    );

    try {
      const result = await submitCheckout(fd);
      clear();
      router.push(`/order/${result.order_number}`);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err
          ? Object.values(err as Record<string, unknown>).flat().join(" ")
          : "Checkout failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-eyebrow">Secure</p>
        <h1 className="section-heading mt-3">Checkout</h1>
        <div className="gold-divider" />
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-3" encType="multipart/form-data">
        <div className="space-y-6 lg:col-span-2">
          <div className="surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-brand-gold">Delivery Details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label">Full Name *</label>
                <input name="full_name" required className="form-input" placeholder="Your full name" />
              </div>
              <div>
                <label className="form-label">Phone *</label>
                <input name="phone" required className="form-input" placeholder="03XXXXXXXXX" maxLength={11} />
              </div>
              <div>
                <label className="form-label">City *</label>
                <input name="city" required className="form-input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Address *</label>
                <textarea name="address" required className="form-input" rows={3} placeholder="House no, street, area" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-input" placeholder="Optional" />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <input name="notes" className="form-input" placeholder="Optional" />
              </div>
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-brand-gold">Payment</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => setPayment("cod")} className={`border p-6 text-left ${payment === "cod" ? "border-brand-gold bg-brand-gold/5" : "border-brand-gold/20"}`}>
                <h3 className="font-serif text-xl">Cash on Delivery</h3>
                <p className="mt-2 text-sm text-brand-mute">Pay when your order arrives.</p>
              </button>
              <button type="button" onClick={() => setPayment("bank_transfer")} className={`border p-6 text-left ${payment === "bank_transfer" ? "border-brand-gold bg-brand-gold/5" : "border-brand-gold/20"}`}>
                <h3 className="font-serif text-xl">Bank Transfer</h3>
                <p className="mt-2 text-sm text-brand-mute">Transfer and upload proof.</p>
              </button>
            </div>

            {payment === "bank_transfer" && config && (
              <div className="mt-6 border border-brand-gold/20 bg-brand-black/60 p-6 text-sm">
                <p className="text-brand-gold">{config.bank_details.bank_name}</p>
                <p className="mt-2 text-brand-cream">{config.bank_details.account_title}</p>
                <p className="mt-1 text-brand-mute">{config.bank_details.account_number}</p>
                <p className="mt-1 text-brand-mute">{config.bank_details.iban}</p>
                <label className="form-label mt-6">Payment Screenshot *</label>
                <input name="payment_screenshot" type="file" accept="image/*,.pdf" required={payment === "bank_transfer"} className="form-input" />
              </div>
            )}
          </div>
        </div>

        <div className="surface h-fit p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-brand-gold">Summary</h2>
          <ul className="mt-6 space-y-3 text-sm text-brand-mute">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-3">
                <span>{i.name} × {i.quantity}</span>
                <span className="text-brand-cream">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-brand-gold/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-brand-mute">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-brand-mute">Shipping</span><span>{formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-serif text-xl text-brand-gold"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold-filled mt-6 w-full disabled:opacity-50">
            {loading ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </form>
    </section>
  );
}
