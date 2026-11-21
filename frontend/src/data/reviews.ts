import { fetchApiReviews, type ApiReview } from "@/lib/api";

/** Site reviews — from Django admin / DB only (no fake hardcoded list). */
export type Review = {
  id: string;
  productSlug: string;
  productName: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  image?: string | null;
};

function mapApiReview(r: ApiReview): Review {
  return {
    id: String(r.id),
    productSlug: r.product_slug ?? "",
    productName: r.product_name ?? "",
    name: r.name,
    city: "",
    rating: Number(r.rating) || 5,
    comment: r.comment,
    image: r.image ?? null,
  };
}

let cache: Review[] | null = null;
let inflight: Promise<Review[]> | null = null;

export async function fetchReviews(productSlug?: string): Promise<Review[]> {
  if (!productSlug && cache) return cache;

  const run = async () => {
    const data = await fetchApiReviews(productSlug);
    const mapped = (Array.isArray(data) ? data : []).map(mapApiReview);
    if (!productSlug) cache = mapped;
    return mapped;
  };

  if (!productSlug) {
    if (!inflight) {
      inflight = run()
        .catch(() => {
          cache = [];
          return [] as Review[];
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  }

  try {
    return await run();
  } catch {
    // Fallback: load all reviews and filter client-side
    try {
      const all = await fetchReviews();
      return all.filter((r) => r.productSlug === productSlug);
    } catch {
      return [];
    }
  }
}

export function getReviewsForProduct(slug: string) {
  return (cache ?? []).filter((r) => r.productSlug === slug);
}

export function getHomeReviews() {
  return cache ?? [];
}

export function reviewStatsForProduct(slug: string) {
  const list = getReviewsForProduct(slug);
  const count = list.length;
  const avg = count === 0 ? 0 : list.reduce((s, r) => s + r.rating, 0) / count;
  return { count, avg };
}
