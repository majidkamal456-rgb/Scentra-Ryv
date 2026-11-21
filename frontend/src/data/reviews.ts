import { apiGet } from "@/lib/api";

/** Site reviews — shared by home testimonials slider + product pages. */
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

type ApiReview = {
  id: number | string;
  name: string;
  rating: number;
  comment: string;
  image?: string | null;
  product_slug?: string;
  product_name?: string;
  created_at?: string;
};

/** Fallback only when API is unreachable (local offline). */
export const FALLBACK_REVIEWS: Review[] = [
  {
    id: "r1",
    productSlug: "eloura",
    productName: "Eloura",
    name: "Ayesha K.",
    city: "Lahore",
    rating: 5,
    comment:
      "Eloura lasts all day on me — soft, floral, and so elegant. Packaging felt premium too. Already ordered again.",
  },
  {
    id: "r2",
    productSlug: "amition-x",
    productName: "Amition X",
    name: "Hassan M.",
    city: "Karachi",
    rating: 5,
    comment:
      "Amition X is my daily signature. Cash on delivery made it easy to try. Smell is close to the inspiration, great value.",
  },
  {
    id: "r3",
    productSlug: "crush-on-you",
    productName: "Crush On You",
    name: "Sara R.",
    city: "Islamabad",
    rating: 5,
    comment:
      "Crush On You is bright and addictive. Delivered to Islamabad in two days. Will gift these for Eid.",
  },
];

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
    try {
      const path = productSlug
        ? `/reviews/?product=${encodeURIComponent(productSlug)}`
        : "/reviews/";
      const data = await apiGet<ApiReview[]>(path);
      const mapped = (Array.isArray(data) ? data : []).map(mapApiReview);
      if (!productSlug) cache = mapped;
      return mapped.length > 0 ? mapped : FALLBACK_REVIEWS;
    } catch {
      return productSlug
        ? FALLBACK_REVIEWS.filter((r) => r.productSlug === productSlug)
        : FALLBACK_REVIEWS;
    }
  };

  if (!productSlug) {
    if (!inflight) inflight = run().finally(() => {
      inflight = null;
    });
    return inflight;
  }
  return run();
}

export function getReviewsForProduct(slug: string) {
  const source = cache ?? FALLBACK_REVIEWS;
  return source.filter((r) => r.productSlug === slug);
}

export function getHomeReviews() {
  return cache ?? FALLBACK_REVIEWS;
}

export function reviewStatsForProduct(slug: string) {
  const list = getReviewsForProduct(slug);
  const count = list.length;
  const avg = count === 0 ? 0 : list.reduce((s, r) => s + r.rating, 0) / count;
  return { count, avg };
}
