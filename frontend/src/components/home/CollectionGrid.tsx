import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export function CollectionGrid() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Collection</p>
        <h2 className="font-serif mt-2 text-3xl md:text-5xl">The six signatures</h2>
      </div>
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-3 md:gap-x-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
