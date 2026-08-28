export const metadata = {
  title: "About Scentra Ryv | Essence & Elixir",
  description: "Discover Scentra Ryv — Essence & Elixir. Luxury fragrances crafted with rare notes and refined presence.",
};

export default function AboutPage() {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-eyebrow">Our Story</p>
        <h1 className="section-heading mt-3">About Scentra Ryv</h1>
        <div className="gold-divider" />
        <div className="mt-10 space-y-6 text-base leading-relaxed text-brand-mute md:text-lg">
          <p className="text-brand-cream/80">
            Scentra Ryv — <em className="not-italic text-brand-gold">Essence & Elixir</em> — was born from a passion for the art of perfumery.
            We believe fragrance is not merely worn; it is experienced, remembered, and cherished.
          </p>
          <p>
            Each of our 50ml elixirs is crafted with rare ingredients — oud, rose, vanilla — blended with restraint and refinement.
          </p>
          <p>From the first spray to the lingering dry-down, a Scentra Ryv fragrance tells a story. Yours.</p>
        </div>
        <a href="/shop" className="btn-gold-filled mt-12 inline-block">Explore the Collection</a>
      </div>
    </section>
  );
}
