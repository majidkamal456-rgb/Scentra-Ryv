import { fetchApiProducts, type ApiProduct } from "@/lib/api";

export type ProductMeta = {
  dbId: number;
  averageRating: number;
  reviewCount: number;
  price?: number;
};

let cache: Record<string, ProductMeta> | null = null;
let inflight: Promise<Record<string, ProductMeta>> | null = null;

function mapProducts(list: ApiProduct[]): Record<string, ProductMeta> {
  const out: Record<string, ProductMeta> = {};
  for (const p of list) {
    out[p.slug] = {
      dbId: p.id,
      averageRating: Number(p.average_rating) || 0,
      reviewCount: Number(p.review_count) || 0,
      price: Number(p.price) || undefined,
    };
  }
  return out;
}

/** Live ratings + Django product PKs (for checkout), keyed by slug. */
export async function fetchProductMeta(): Promise<Record<string, ProductMeta>> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchApiProducts()
      .then((list) => {
        cache = mapProducts(Array.isArray(list) ? list : []);
        return cache;
      })
      .catch(() => {
        cache = {};
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function getCachedProductMeta(slug: string): ProductMeta | undefined {
  return cache?.[slug];
}
