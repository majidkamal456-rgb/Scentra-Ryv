import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Scentra Ryv — WhatsApp support and nationwide delivery questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-20 lg:px-8">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Contact</p>
      <h1 className="font-serif mt-2 text-4xl md:text-5xl">We&apos;re here</h1>
      <p className="mt-4 text-[var(--muted)]">
        Questions about an order, fragrance recommendations, or delivery? Reach us on WhatsApp —
        we typically reply the same day.
      </p>
      <div className="mt-10 space-y-6 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">WhatsApp</p>
          <a
            href="https://wa.me/923177478167"
            className="mt-1 inline-block text-lg hover:text-[var(--gold)]"
          >
            +92 317 7478167
          </a>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Delivery</p>
          <p className="mt-1 text-[var(--muted)]">Nationwide across Pakistan · Cash on Delivery</p>
        </div>
      </div>
      <a href="https://wa.me/923177478167" className="btn-gold mt-8 inline-flex">
        Message on WhatsApp
      </a>
    </div>
  );
}
