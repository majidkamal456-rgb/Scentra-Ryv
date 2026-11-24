"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchProductMeta } from "@/data/productMeta";
import { formatPrice, products } from "@/data/products";
import { apiPostJson, type CheckoutResponse } from "@/lib/api";
import { useCart, useCartHydrated } from "@/store/cart";

type TesterSlot = {
  key: string;
  label: string;
  forProductName: string;
  slug: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal);
  const clear = useCart((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [idBySlug, setIdBySlug] = useState<Record<string, number>>({});
  const [testerSlugs, setTesterSlugs] = useState<string[]>([]);
  const safeItems = hydrated ? items : [];

  const paidUnits = useMemo(
    () => safeItems.reduce((n, i) => n + i.quantity, 0),
    [safeItems],
  );

  const testerSlots: TesterSlot[] = useMemo(() => {
    const slots: TesterSlot[] = [];
    let n = 1;
    for (const item of safeItems) {
      for (let q = 0; q < item.quantity; q++) {
        slots.push({
          key: `${item.productId}-${q}`,
          label: `Free tester #${n}`,
          forProductName: item.name,
          slug: products[0]?.slug ?? "amition-x",
        });
        n += 1;
      }
    }
    return slots;
  }, [safeItems]);

  useEffect(() => {
    fetchProductMeta().then((meta) => {
      const map: Record<string, number> = {};
      for (const [slug, m] of Object.entries(meta)) map[slug] = m.dbId;
      setIdBySlug(map);
    });
  }, []);

  // Keep one tester choice per paid perfume unit
  useEffect(() => {
    setTesterSlugs((prev) => {
      const defaultSlug = products[0]?.slug ?? "amition-x";
      return testerSlots.map((slot, i) => prev[i] || slot.slug || defaultSlug);
    });
  }, [testerSlots]);

  function setTesterAt(index: number, slug: string) {
    setTesterSlugs((prev) => {
      const next = [...prev];
      next[index] = slug;
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const paymentRaw = String(fd.get("payment") || "cod");
    const payment_method = paymentRaw === "bank" ? "bank_transfer" : "cod";

    try {
      const meta =
        Object.keys(idBySlug).length > 0
          ? idBySlug
          : await fetchProductMeta().then((m) => {
              const map: Record<string, number> = {};
              for (const [slug, v] of Object.entries(m)) map[slug] = v.dbId;
              return map;
            });

      const apiItems = safeItems.map((item) => {
        const dbId = meta[item.slug] ?? Number(item.productId);
        if (!dbId || Number.isNaN(dbId)) {
          throw new Error(`Product not found in store: ${item.name}`);
        }
        return {
          product_id: dbId,
          quantity: item.quantity,
          size: item.sizeMl,
        };
      });

      if (testerSlugs.length !== paidUnits) {
        throw new Error(`Please choose ${paidUnits} free tester${paidUnits > 1 ? "s" : ""}.`);
      }

      const freeTesterIds = testerSlugs.map((slug) => {
        const id = meta[slug];
        if (!id) throw new Error(`Please choose a valid free tester (${slug}).`);
        return id;
      });

      const res = await apiPostJson<CheckoutResponse>("/checkout/", {
        full_name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        city: String(fd.get("city") || "").trim(),
        address: String(fd.get("address") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        notes: String(fd.get("notes") || "").trim(),
        payment_method,
        items: apiItems,
        free_tester_product_ids: freeTesterIds,
      });

      clear();
      router.push(`/order/${encodeURIComponent(res.order_number)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order. Try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
        <p className="text-[var(--muted)]">Loading checkout…</p>
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
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-20 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Cash on Delivery · Bank transfer also accepted
          </p>
          <p className="mt-3 border border-[var(--gold)]/30 bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-3 py-2 text-[11px] tracking-[0.12em] text-[var(--gold)] uppercase">
            Buy perfume · get free tester — {paidUnits} tester{paidUnits > 1 ? "s" : ""} included
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Full name" name="name" required />
            <Field label="Phone" name="phone" type="tel" required placeholder="03XXXXXXXXX" />
            <Field label="City" name="city" required />
            <Field label="Email (optional)" name="email" type="email" />
            <label className="block">
              <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                Address
              </span>
              <textarea name="address" required rows={3} className="input-field resize-none" />
            </label>

            <fieldset className="space-y-4 border border-[var(--gold)]/35 bg-[color-mix(in_srgb,var(--gold)_6%,transparent)] p-4">
              <legend className="px-2 text-[11px] tracking-[0.16em] text-[var(--gold)] uppercase">
                Choose your free tester{paidUnits > 1 ? "s" : ""}
              </legend>
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                You bought <strong className="text-[var(--fg)]">{paidUnits}</strong> perfume
                {paidUnits > 1 ? "s" : ""}. Pick any scent as free tester for each — e.g. buy{" "}
                <em>Prime Ryv</em>, get <em>Crush On You</em> tester.
              </p>
              {testerSlots.map((slot, index) => (
                <label key={slot.key} className="block">
                  <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-[var(--gold)] uppercase">
                    {slot.label}{" "}
                    <span className="text-[var(--muted)] normal-case tracking-normal">
                      (for your {slot.forProductName})
                    </span>
                  </span>
                  <select
                    required
                    value={testerSlugs[index] ?? products[0]?.slug ?? ""}
                    onChange={(e) => setTesterAt(index, e.target.value)}
                    className="input-field"
                  >
                    {products.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} — Free Tester
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </fieldset>

            <label className="block">
              <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                Notes (optional)
              </span>
              <textarea name="notes" rows={2} className="input-field resize-none" />
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
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button type="submit" className="btn-gold w-full" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
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
            {testerSlots.map((slot, index) => {
              const name =
                products.find((p) => p.slug === testerSlugs[index])?.name ?? "Tester";
              return (
                <li key={`t-${slot.key}`} className="flex justify-between gap-4 text-sm text-[var(--gold)]">
                  <span>
                    {name} · Free Tester
                    <span className="mt-0.5 block text-[10px] tracking-wide text-[var(--muted)] normal-case">
                      with {slot.forProductName}
                    </span>
                  </span>
                  <span>Rs. 0</span>
                </li>
              );
            })}
          </ul>
          <div className="gold-rule my-5" />
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="font-serif text-xl text-[var(--gold)]">{formatPrice(subtotal())}</span>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {paidUnits} free tester{paidUnits > 1 ? "s" : ""} · Shipping confirmed after order
          </p>
        </aside>
      </div>
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
