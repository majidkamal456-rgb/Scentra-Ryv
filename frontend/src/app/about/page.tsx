import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "The story of Scentra Ryv — Essence & Elixir. Luxury fragrances for Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 lg:px-8">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Our story</p>
      <h1 className="font-serif mt-2 text-4xl md:text-6xl">Essence & Elixir</h1>
      <div className="gold-rule my-8 max-w-xs" />
      <div className="space-y-5 text-base leading-relaxed text-[var(--muted)] md:text-lg">
        <p>
          Scentra Ryv was born from a simple belief: luxury fragrance should feel intimate,
          memorable, and within reach — without compromising on presence.
        </p>
        <p>
          Each bottle is composed as a modern interpretation of iconic houses, refined for everyday
          wear in Pakistan&apos;s climate. From boardroom to evening, our signatures are made to
          linger like a whispered promise.
        </p>
        <p>
          We deliver nationwide with Cash on Delivery so you can experience the scent before you
          fully commit — and we stand behind every order with easy returns and WhatsApp support.
        </p>
      </div>
      <Link href="/shop" className="btn-gold mt-10 inline-flex">
        Shop collection
      </Link>
    </div>
  );
}
