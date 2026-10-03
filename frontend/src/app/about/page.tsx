import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Scentra Ryv | Essence & Elixir",
  description: "Discover Scentra Ryv — Essence & Elixir. Luxury fragrances crafted with rare notes and refined presence.",
};

export default function AboutPage() {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="fade-section visible text-center">
          <Image
            src="/images/logo.png"
            alt="Scentra Ryv — Essence & Elixir"
            width={280}
            height={320}
            priority
            className="brand-emblem mx-auto"
          />
          <h1 className="sr-only">About Scentra Ryv</h1>
          <div className="gold-divider" />
        </div>
        <div className="fade-section visible mt-10 space-y-6 text-center text-base leading-relaxed text-brand-mute md:text-lg">
          <p className="text-brand-cream/80">
            Scentra Ryv — <em className="not-italic text-brand-gold">Essence &amp; Elixir</em> — was born from a passion
            for the art of perfumery. We believe fragrance is not merely worn; it is experienced, remembered, and cherished.
          </p>
          <p>
            Each of our elixirs is crafted with rare ingredients sourced from the finest regions — Cambodian oud, Moroccan
            rose, Madagascar vanilla — blended by master perfumers who understand that true luxury lies in restraint and
            refinement.
          </p>
          <p>From the first spray to the lingering dry-down, a Scentra Ryv fragrance tells a story. Yours.</p>
        </div>
        <div className="mt-12 text-center">
          <Link href="/shop" className="btn-gold-filled">Explore the Collection</Link>
        </div>
      </div>
    </section>
  );
}
