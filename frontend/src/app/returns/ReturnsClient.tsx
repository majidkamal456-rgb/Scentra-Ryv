"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { errorMessage, submitReturn, WHATSAPP_DISPLAY } from "@/lib/api";
import { useToast } from "@/lib/toast";

const REASONS = [
  ["damaged", "Damaged or leaked in transit"],
  ["wrong_item", "Wrong product received"],
  ["not_as_described", "Product not as described"],
  ["quality", "Quality concern"],
  ["other", "Other"],
];

const GUIDELINES = [
  "Opened, sprayed, or partially used fragrances cannot be returned for hygiene reasons.",
  null, // packaging line rendered separately (contains emphasis)
  "Exchanges depend on stock; otherwise a store credit or refund may be offered after inspection.",
  "Shipping fees on returns are non-refundable unless the mistake was ours (wrong or damaged item).",
];

export function ReturnsClient({ whatsappNumber }: { whatsappNumber: string }) {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [photoName, setPhotoName] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const fd = new FormData(form);
      const res = await submitReturn(fd);
      setMessage(res.message);
      showToast(res.message);
      form.reset();
      setPhone("");
      setPhotoName("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = errorMessage(err, "Submission failed. Please try again.");
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const waHref = `https://wa.me/${whatsappNumber}`;

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-hero fade-section visible pb-10!">
          <p className="section-eyebrow">Customer Care</p>
          <h1 className="section-heading mt-4">Returns &amp; Exchanges</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-brand-mute">
            Ordered a 50ml Scentra Ryv elixir and need help? Submit the form below — we aim to respond within 1–2
            business days.
          </p>
        </div>

        <div className="fade-section visible flex flex-wrap items-center justify-center gap-3">
          <Link href="/returns" className="chip chip-active">Return Form</Link>
          <Link href="/shipping-policy" className="chip">Shipping Policy</Link>
          <Link href="/contact" className="chip">Contact Us</Link>
        </div>

        <div className="fade-section visible mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["15", "Day Return Window"],
            ["50ml", "Standard Bottle Size"],
            ["Sealed", "Unopened Items Only"],
          ].map(([v, l]) => (
            <div key={l} className="feature-tile py-8!">
              <p className="font-serif text-4xl text-brand-gold">{v}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-brand-mute">{l}</p>
            </div>
          ))}
        </div>

        <div className="surface fade-section visible mt-10 p-7 sm:p-10">
          <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Before You Apply</h2>
          <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.85] text-brand-cream/75">
            <p>
              Returns and exchanges are accepted within <strong className="text-brand-cream">15 days</strong> of delivery
              for unopened, sealed 50ml bottles in their original presentation box.
            </p>
            <ul className="space-y-4 border-t border-brand-gold/10 pt-6 text-brand-mute">
              {GUIDELINES.map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold/70" />
                  {text ? (
                    <span>{text}</span>
                  ) : (
                    <span>
                      Items must arrive back in saleable condition with the original Scentra Ryv gift box. Replacement
                      packaging may cost <strong className="text-brand-cream">Rs. 200–350</strong> if yours is missing or
                      damaged.
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface fade-section visible mt-8 p-7 sm:p-10">
          <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Return Request Form</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-mute">Fields marked with * are required.</p>

          {message && (
            <p className="mt-6 border border-brand-gold/40 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold">{message}</p>
          )}
          {error && <p className="mt-6 border border-red-400/40 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}

          <form onSubmit={onSubmit} className="mt-8 space-y-6" encType="multipart/form-data">
            <div>
              <label className="form-label" htmlFor="r-full_name">Full Name *</label>
              <input id="r-full_name" name="full_name" required maxLength={200} className="form-input" placeholder="Your full name" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label" htmlFor="r-phone">Phone Number *</label>
                <input
                  id="r-phone"
                  name="phone"
                  required
                  inputMode="numeric"
                  maxLength={11}
                  className="form-input"
                  placeholder="03XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
                <p className="mt-2 text-xs leading-relaxed text-brand-mute">11 digits — e.g. 03001234567</p>
              </div>
              <div>
                <label className="form-label" htmlFor="r-email">Email (optional)</label>
                <input id="r-email" name="email" type="email" className="form-input" placeholder="Email (optional)" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label" htmlFor="r-order">Order Number *</label>
                <input id="r-order" name="order_number" required className="form-input" placeholder="e.g. SR-20260825-ABC123" />
              </div>
              <div>
                <label className="form-label" htmlFor="r-product">Product Name *</label>
                <input id="r-product" name="product_name" required className="form-input" placeholder="Perfume name from your order" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="r-reason">Reason *</label>
              <select id="r-reason" name="reason" required className="form-input" defaultValue="damaged">
                {REASONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="r-details">Details *</label>
              <textarea
                id="r-details"
                name="details"
                required
                rows={4}
                className="form-input"
                placeholder="Tell us what happened and how we can help"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="r-photo">Photo (optional)</label>
              <div className="mt-1 border border-dashed border-brand-gold/30 bg-brand-ink/40 px-5 py-6">
                <input
                  id="r-photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="block w-full text-sm text-brand-cream/80 file:mr-4 file:border file:border-brand-gold/40 file:bg-transparent file:px-4 file:py-2 file:text-[11px] file:uppercase file:tracking-[0.18em] file:text-brand-gold hover:file:border-brand-gold"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name || "")}
                />
                <p className="mt-3 text-xs leading-relaxed text-brand-mute">
                  {photoName
                    ? `Selected: ${photoName}`
                    : "Upload a photo if the bottle or gift box arrived damaged — JPG, PNG, or PDF, max 5MB."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-brand-gold/10 pt-8 sm:flex-row sm:items-center">
              <button type="submit" disabled={loading} className="btn-gold-filled w-full sm:w-auto">
                {loading ? "Submitting…" : "Submit Return Request"}
              </button>
              <a href={waHref} target="_blank" rel="noopener" className="btn-gold w-full text-center sm:w-auto">
                WhatsApp Support
              </a>
            </div>
          </form>
        </div>

        <p className="fade-section visible mt-8 text-center text-sm leading-relaxed text-brand-mute">
          Prefer WhatsApp? Message us at{" "}
          <a href={waHref} target="_blank" rel="noopener" className="text-brand-gold underline">
            {WHATSAPP_DISPLAY}
          </a>{" "}
          with your order number.
        </p>
      </div>
    </section>
  );
}
