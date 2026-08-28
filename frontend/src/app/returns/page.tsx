"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { submitReturn } from "@/lib/api";

export default function ReturnsPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await submitReturn(fd);
      setMessage(res.message);
      e.currentTarget.reset();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err
          ? Object.values(err as Record<string, unknown>).flat().join(" ")
          : "Submission failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="pb-10 text-center">
          <p className="section-eyebrow">Customer Care</p>
          <h1 className="section-heading mt-4">Returns & Exchanges</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-4 max-w-lg text-brand-mute">
            Ordered a 50ml Scentra Ryv elixir and need help? We aim to respond within 1–2 business days.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Link href="/returns" className="chip chip-active">Return Form</Link>
          <Link href="/shipping-policy" className="chip">Shipping Policy</Link>
          <Link href="/contact" className="chip">Contact Us</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["15", "Day Return Window"],
            ["50ml", "Standard Bottle Size"],
            ["Sealed", "Unopened Items Only"],
          ].map(([v, l]) => (
            <div key={l} className="feature-tile !py-8">
              <p className="font-serif text-4xl text-brand-gold">{v}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-brand-mute">{l}</p>
            </div>
          ))}
        </div>

        <div className="surface mt-10 p-7 sm:p-10">
          <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Before You Apply</h2>
          <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.85] text-brand-cream/75">
            <p>
              Returns within <strong className="text-brand-cream">15 days</strong> for unopened, sealed 50ml bottles in original box.
              Replacement packaging may cost <strong className="text-brand-cream">Rs. 200–350</strong>.
            </p>
          </div>
        </div>

        <div className="surface mt-8 p-7 sm:p-10">
          <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Return Request Form</h2>
          <form onSubmit={onSubmit} className="mt-8 space-y-6" encType="multipart/form-data">
            <div>
              <label className="form-label">Full Name *</label>
              <input name="full_name" required className="form-input" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label">Phone *</label>
                <input name="phone" required className="form-input" placeholder="03XXXXXXXXX" maxLength={11} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-input" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label">Order Number *</label>
                <input name="order_number" required className="form-input" />
              </div>
              <div>
                <label className="form-label">Product Name *</label>
                <input name="product_name" required className="form-input" />
              </div>
            </div>
            <div>
              <label className="form-label">Reason *</label>
              <select name="reason" required className="form-input">
                <option value="damaged">Damaged or leaked in transit</option>
                <option value="wrong_item">Wrong product received</option>
                <option value="not_as_described">Product not as described</option>
                <option value="quality">Quality concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Details *</label>
              <textarea name="details" required rows={4} className="form-input" />
            </div>
            <div>
              <label className="form-label">Photo (optional)</label>
              <input name="photo" type="file" accept="image/*,.pdf" className="form-input" />
            </div>
            {message && <p className="text-sm text-brand-gold">{message}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold-filled disabled:opacity-50">
              {loading ? "Submitting…" : "Submit Return Request"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
