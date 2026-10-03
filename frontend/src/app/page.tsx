import Link from "next/link";
import { FadeSection } from "@/components/FadeSection";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { fetchProducts, type Product } from "@/lib/api";

export const metadata = {
  title: "Home | Scentra Ryv",
};

const FEATURES = [
  {
    title: "Long-lasting",
    copy: "Premium concentration for all-day presence",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Premium Ingredients",
    copy: "Rare oud, amber, and botanical extracts",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    title: "Cash on Delivery",
    copy: "Pay when your order arrives",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "Easy Returns",
    copy: "Hassle-free support via WhatsApp",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
];

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
      <HeroSlider />

      {/* Collection */}
      <FadeSection className="page-shell">
        <div className="text-center">
          <p className="section-eyebrow">Curated</p>
          <h2 className="section-heading mt-3">Our Collection</h2>
          <div className="gold-divider" />
          <p className="mx-auto max-w-xl text-brand-mute">
            Six exquisite fragrances — each a journey through rare notes and timeless elegance.
          </p>
        </div>
        <div className="stagger-children mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-brand-mute">
              No products yet. Run <code className="text-brand-gold">python manage.py seed_products</code>
            </p>
          )}
        </div>
        <div className="mt-14 text-center">
          <Link href="/shop" className="btn-gold">View All Fragrances</Link>
        </div>
      </FadeSection>

      {/* Why */}
      <FadeSection className="border-y border-brand-gold/10 bg-brand-ink/60 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="section-eyebrow">The Difference</p>
            <h2 className="section-heading mt-3">Why Scentra Ryv</h2>
            <div className="gold-divider" />
          </div>
          <div className="stagger-children mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-tile group">
                <div className="feature-tile__icon">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-brand-cream">{f.title}</h3>
                <p className="mt-2 text-sm text-brand-mute">{f.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* Testimonials */}
      <FadeSection className="page-shell">
        <div className="text-center">
          <p className="section-eyebrow">Voices</p>
          <h2 className="section-heading mt-3">What Our Clients Say</h2>
          <div className="gold-divider" />
        </div>
        <TestimonialSlider />
      </FadeSection>
    </>
  );
}
