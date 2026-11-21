"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/data/products";
import { useCart, useCartHydrated } from "@/store/cart";

export default function CheckoutPage() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal);
  const clear = useCart((s) => s.clear);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const safeItems = hydrated ? items : [];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = `SR-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    clear();
    setDone(true);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
        <p className="text-[var(--muted)]">Loading checkout…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
        <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Thank you</p>
        <h1 className="font-serif mt-2 text-4xl">Order received</h1>
        <p className="mt-4 text-[var(--muted)]">
          Your order <span className="text-[var(--gold)]">{orderId}</span> is confirmed. We&apos;ll
          contact you on WhatsApp to arrange Cash on Delivery.
        </p>
        <Link href="/shop" className="btn-gold mt-8 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
        <h1 className="font-serif text-4xl">Checkout</h1>
        <p className="mt-4 text-[var(--muted)]">Your cart is empty.</p>
        <Link href="/shop" className="btn-gold mt-8 inline-flex">
          Shop collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 pt-28 pb-20 lg:grid-cols-2 lg:px-8">
      <div>
        <h1 className="font-serif text-4xl">Checkout</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Cash on Delivery · Bank transfer also accepted
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name" name="name" required />
          <Field label="Phone" name="phone" type="tel" required placeholder="03XXXXXXXXX" />
          <Field label="City" name="city" required />
          <label className="block">
            <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
              Address
            </span>
            <textarea name="address" required rows={3} className="input-field resize-none" />
          </label>
          <fieldset className="border border-[var(--border)] p-4">
            <legend className="px-2 text-[11px] tracking-[0.16em] text-[var(--gold)] uppercase">
              Payment
            </legend>
            <label className="flex items-center gap-3 text-sm">
              <input type="radio" name="payment" value="cod" defaultChecked className="accent-[var(--gold)]" />
              Cash on Delivery
            </label>
            <label className="mt-2 flex items-center gap-3 text-sm">
              <input type="radio" name="payment" value="bank" className="accent-[var(--gold)]" />
              Bank transfer
            </label>
          </fieldset>
          <button type="submit" className="btn-gold w-full">
            Place order
          </button>
        </form>
      </div>

      <aside className="border border-[var(--border)] bg-[var(--surface)] p-6 h-fit">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <ul className="mt-6 space-y-4">
          {safeItems.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-[var(--gold)]">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="gold-rule my-5" />
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Subtotal</span>
          <span className="font-serif text-xl text-[var(--gold)]">{formatPrice(subtotal())}</span>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Shipping confirmed after order · Nationwide</p>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="input-field"
      />
    </label>
  );
}
