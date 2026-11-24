/** Django API origin. Empty = same-origin `/api/store/...` (nginx proxy). */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api/store${normalized}`;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === "object" && data
        ? Object.values(data as Record<string, unknown>)
            .flat()
            .map(String)
            .join(" ")
        : `API ${path} failed: ${res.status}`;
    throw new Error(msg || `API ${path} failed: ${res.status}`);
  }
  return data as T;
}

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  price: string | number;
  size_ml?: string;
  image_main?: string | null;
  gender?: string;
  average_rating?: number | null;
  review_count?: number;
};

export type ApiReview = {
  id: number | string;
  name: string;
  rating: number;
  comment: string;
  image?: string | null;
  video?: string | null;
  product_slug?: string;
  product_name?: string;
  created_at?: string;
};

export type ApiProductImage = {
  id: number;
  image: string;
  alt_text?: string;
  order?: number;
};

export type ApiProductDetail = ApiProduct & {
  description?: string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  images?: ApiProductImage[];
  reviews?: ApiReview[];
  rating_breakdown?: Array<{ stars: number; count: number; percent: number }>;
};

export type CheckoutResponse = {
  order_number: string;
  total_amount: string;
  shipping: string;
  subtotal: string;
  status: string;
  payment_method: string;
  free_tester_name?: string | null;
};

export type ApiOrder = {
  order_number: string;
  full_name: string;
  phone: string;
  city: string;
  address: string;
  payment_method: string;
  status: string;
  subtotal: string;
  shipping: string;
  total_amount: string;
  created_at?: string;
  free_tester_name?: string | null;
  items: Array<{
    product_name: string;
    size_ml: string;
    quantity: number;
    price_at_purchase: string;
    line_total: string;
  }>;
};

export function fetchApiProducts() {
  return apiGet<ApiProduct[]>("/products/");
}

export function fetchApiReviews(productSlug?: string) {
  const path = productSlug
    ? `/reviews/?product=${encodeURIComponent(productSlug)}`
    : "/reviews/";
  return apiGet<ApiReview[]>(path);
}

export function fetchApiProductDetail(slug: string) {
  return apiGet<ApiProductDetail>(`/products/${encodeURIComponent(slug)}/`);
}

export function fetchApiOrder(orderNumber: string) {
  return apiGet<ApiOrder>(`/orders/${encodeURIComponent(orderNumber)}/`);
}
