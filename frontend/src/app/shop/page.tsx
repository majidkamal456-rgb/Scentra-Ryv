import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/api";
import { SortSelect } from "./SortSelect";

export const metadata = {
  title: "Scentra Ryv | Shop",
  description: "Luxury perfumes by Scentra Ryv. Premium fragrances with cash on delivery nationwide.",
};

type Props = { searchParams: Promise<{ gender?: string; sort?: string }> };

const GENDERS = [
  { key: "", label: "All" },
  { key: "unisex", label: "Unisex" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
];

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const gender = ["men", "women", "unisex"].includes(params.gender || "") ? (params.gender as string) : "";
  const sort = ["name", "price_asc", "price_desc"].includes(params.sort || "") ? (params.sort as string) : "name";

  let products: Product[] = [];
  try {
    products = await fetchProducts({ gender: gender || undefined, sort });
  } catch {
    products = [];
  }

  return (
    <section className="page-shell">
      <div className="page-hero fade-section visible">
        <p className="section-eyebrow">Boutique</p>
        <h1 className="section-heading mt-3">Shop All Fragrances</h1>
        <div className="gold-divider" />
        <p className="text-brand-mute">Discover your signature scent from our luxury collection</p>
      </div>

      <div className="fade-section visible mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/10 pb-6">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => {
            const sp = new URLSearchParams();
            if (g.key) sp.set("gender", g.key);
            if (g.key && sort !== "name") sp.set("sort", sort);
            const q = sp.toString();
            return (
              <Link key={g.key || "all"} href={`/shop${q ? `?${q}` : ""}`} className={`chip ${gender === g.key ? "chip-active" : ""}`}>
                {g.label}
              </Link>
            );
          })}
        </div>
        <SortSelect gender={gender} sort={sort} />
      </div>

      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full py-20 text-center text-brand-mute">No products found.</p>
        )}
      </div>
    </section>
  );
}
