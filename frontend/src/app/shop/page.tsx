import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/api";

export const metadata = {
  title: "Scentra Ryv | Shop",
  description: "Luxury perfumes by Scentra Ryv. Premium fragrances with cash on delivery nationwide.",
};

type Props = { searchParams: Promise<{ gender?: string; sort?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const gender = params.gender || "";
  const sort = params.sort || "name";

  let products: Product[] = [];
  try {
    products = await fetchProducts({ gender: gender || undefined, sort });
  } catch {
    products = [];
  }

  const genders = [
    { key: "", label: "All" },
    { key: "unisex", label: "Unisex" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
  ];

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl pb-10 text-center">
        <p className="section-eyebrow">Boutique</p>
        <h1 className="section-heading mt-3">Shop All Fragrances</h1>
        <div className="gold-divider" />
        <p className="text-brand-mute">Discover your signature scent from our luxury collection</p>
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/10 pb-6">
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => {
            const href = g.key
              ? `/shop?gender=${g.key}${sort !== "name" ? `&sort=${sort}` : ""}`
              : `/shop${sort !== "name" ? `?sort=${sort}` : ""}`;
            return (
              <Link
                key={g.key || "all"}
                href={href}
                className={`chip ${gender === g.key ? "chip-active" : ""}`}
              >
                {g.label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-2">
          {[
            { key: "name", label: "Name" },
            { key: "price_asc", label: "Price ↑" },
            { key: "price_desc", label: "Price ↓" },
          ].map((s) => {
            const href = gender
              ? `/shop?gender=${gender}&sort=${s.key}`
              : `/shop?sort=${s.key}`;
            return (
              <Link key={s.key} href={href} className={`chip ${sort === s.key ? "chip-active" : ""}`}>
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-center text-brand-mute">No products found.</p>
        )}
      </div>
    </section>
  );
}
