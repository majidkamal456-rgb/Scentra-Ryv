import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/api";

export const metadata = {
  title: "Scentra Ryv | Home",
};

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await fetchProducts({ featured: true });
    if (products.length < 6) products = await fetchProducts();
    products = products.slice(0, 6);
  } catch {
    products = [];
  }

  return (
    <>
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-brand-ink">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,164,76,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black/90" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
          <p className="section-eyebrow mb-5">Essence & Elixir</p>
          <h1 className="font-display text-5xl font-semibold tracking-[0.08em] text-gradient-gold md:text-7xl lg:text-8xl">
            Scentra Ryv
          </h1>
          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-brand-cream/65 md:text-lg">
            Luxury fragrances that linger like a whispered promise.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="btn-gold-filled">Shop Collection</Link>
            <Link href="/about" className="btn-gold">Our Story</Link>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="text-center">
          <p className="section-eyebrow">Curated</p>
          <h2 className="section-heading mt-3">Our Collection</h2>
          <div className="gold-divider" />
          <p className="mx-auto max-w-xl text-brand-mute">
            Exquisite 50ml fragrances — each a journey through rare notes and timeless elegance.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-brand-mute">
              No products yet. Start Django and run seed_products.
            </p>
          )}
        </div>
        <div className="mt-14 text-center">
          <Link href="/shop" className="btn-gold">View All Fragrances</Link>
        </div>
      </section>

      <section className="border-y border-brand-gold/10 bg-brand-ink/60 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <p className="section-eyebrow">The Difference</p>
          <h2 className="section-heading mt-3">Why Scentra Ryv</h2>
          <div className="gold-divider" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Long-Lasting", "Crafted to linger from first spray to dry-down."],
              ["50ml Luxury", "Premium bottles in signature gift boxes."],
              ["Cash on Delivery", "Pay when your fragrance arrives."],
              ["Nationwide", "Trusted courier delivery across Pakistan."],
            ].map(([title, copy]) => (
              <div key={title} className="feature-tile">
                <h3 className="font-serif text-xl text-brand-gold">{title}</h3>
                <p className="mt-3 text-sm text-brand-mute">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
