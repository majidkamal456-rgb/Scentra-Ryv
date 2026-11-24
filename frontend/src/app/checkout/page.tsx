"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CitySelect } from "@/components/CitySelect";
import { fetchProductMeta } from "@/data/productMeta";
import { formatPrice, products } from "@/data/products";
import { apiGet, apiPostForm, type CheckoutResponse } from "@/lib/api";
import {
  estimateShippingForCity,
  hasFreeShipping,
  SHIPPING_OTHER,
  type ShippingCity,
} from "@/lib/shipping";
import { useCart, useCartHydrated } from "@/store/cart";

type TesterSlot = {
  key: string;
  label: string;
  forProductName: string;
  slug: string;
};

type BankDetails = {
  bank_name?: string;
  account_title?: string;
  account_number?: string;
  iban?: string;
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
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const safeItems = hydrated ? items : [];

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === selectedCityId) ?? null,
    [cities, selectedCityId],
  );
  const city = selectedCity?.name?.trim() || "";

  const paidUnits = useMemo(
    () => safeItems.reduce((n, i) => n + i.quantity, 0),
    [safeItems],
  );

  const shipping = useMemo(() => estimateShippingForCity(selectedCity), [selectedCity]);
  const cartSubtotal = hydrated ? subtotal() : 0;
  const orderTotal = cartSubtotal + shipping;
  const freeDelivery = hasFreeShipping(selectedCity);

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

  useEffect(() => {
    let cancelled = false;
    setCitiesLoading(true);
    apiGet<{ cities: ShippingCity[] }>("/cities/")
      .then((res) => {
        if (!cancelled) setCities(res.cities ?? []);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      })
      .finally(() => {
        if (!cancelled) setCitiesLoading(false);
      });
    apiGet<{ bank_details?: BankDetails }>("/config/")
      .then((res) => {
        if (!cancelled) setBankDetails(res.bank_details ?? null);
      })
      .catch(() => {
        if (!cancelled) setBankDetails(null);
      });
    return () => {
      cancelled = true;
    };
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
    const payment_method = paymentMethod === "bank" ? "bank_transfer" : "cod";

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

      if (!selectedCity) throw new Error("Please select your city from the list.");
      if (paymentMethod === "bank" && !paymentScreenshot) {
        throw new Error("Payment screenshot is required for bank transfer.");
      }

      const payload = new FormData();
      payload.append("full_name", String(fd.get("name") || "").trim());
      payload.append("phone", String(fd.get("phone") || "").trim());
      payload.append("city", selectedCity.name.trim());
      payload.append("address", String(fd.get("address") || "").trim());
      payload.append("email", String(fd.get("email") || "").trim());
      payload.append("notes", String(fd.get("notes") || "").trim());
      payload.append("payment_method", payment_method);
      payload.append("items", JSON.stringify(apiItems));
      payload.append("free_tester_product_ids", JSON.stringify(freeTesterIds));
      if (paymentScreenshot) {
        payload.append("payment_screenshot", paymentScreenshot);
      }

      const res = await apiPostForm<CheckoutResponse>("/checkout/", payload);

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
            <div className="block">
              <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                City
              </span>
              <CitySelect
                cities={cities}
                loading={citiesLoading}
                selectedId={selectedCityId}
                onSelect={(c) => setSelectedCityId(c?.id ?? null)}
              />
            </div>
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="flaship_city_id" value={selectedCity?.id ?? ""} />
            <Field label="Email (optional)" name="email" type="email" />
            <label className="block">
              <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                Address
              </span>
              <textarea
                name="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field resize-none"
              />
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
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => {
                    setPaymentMethod("cod");
                    setPaymentScreenshot(null);
                  }}
                  className="accent-[var(--gold)]"
                />
                Cash on Delivery
              </label>
              <label className="mt-2 flex items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="accent-[var(--gold)]"
                />
                Bank transfer
              </label>

              {paymentMethod === "bank" ? (
                <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
                  {bankDetails ? (
                    <div className="space-y-1 text-xs leading-relaxed text-[var(--muted)]">
                      <p>
                        Bank:{" "}
                        <strong className="text-[var(--fg)]">{bankDetails.bank_name}</strong>
                      </p>
                      <p>
                        Title:{" "}
                        <strong className="text-[var(--fg)]">{bankDetails.account_title}</strong>
                      </p>
                      <p>
                        Account:{" "}
                        <strong className="text-[var(--fg)]">{bankDetails.account_number}</strong>
                      </p>
                      {bankDetails.iban ? (
                        <p>
                          IBAN:{" "}
                          <strong className="text-[var(--fg)]">{bankDetails.iban}</strong>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                      Payment screenshot
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required={paymentMethod === "bank"}
                      onChange={(e) => setPaymentScreenshot(e.target.files?.[0] ?? null)}
                      className="input-field file:mr-3 file:border-0 file:bg-transparent file:text-sm file:text-[var(--gold)]"
                    />
                    <span className="mt-1.5 block text-[11px] text-[var(--muted)]">
                      Upload transfer receipt / screenshot (required).
                    </span>
                  </label>
                </div>
              ) : null}
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
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-[var(--muted)]">
              Shipping
              {selectedCity ? (
                <span className="mt-0.5 block text-[10px] tracking-wide normal-case">
                  {freeDelivery ? "Free delivery" : `Rs. ${SHIPPING_OTHER} shipping`}
                </span>
              ) : (
                <span className="mt-0.5 block text-[10px] tracking-wide normal-case">
                  Select city to calculate
                </span>
              )}
            </span>
            <span className="text-[var(--gold)]">
              {selectedCity ? formatPrice(shipping) : "—"}
            </span>
          </div>
          <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
            <span className="text-[var(--muted)]">Total</span>
            <span className="font-serif text-xl text-[var(--gold)]">
              {selectedCity ? formatPrice(orderTotal) : formatPrice(cartSubtotal)}
            </span>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {paidUnits} free tester{paidUnits > 1 ? "s" : ""} · Rs. 181 Leopard areas free ·
            else Rs. {SHIPPING_OTHER}
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
