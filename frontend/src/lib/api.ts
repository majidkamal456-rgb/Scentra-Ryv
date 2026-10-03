export type RatingBreakdown = {
  stars: number;
  count: number;
  percent: number;
};

export type ProductReview = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  image: string | null;
  video: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  price: string;
  size_ml: string;
  stock: number;
  image_main: string | null;
  gender: string;
  is_featured: boolean;
  in_stock: boolean;
  average_rating?: number;
  review_count?: number;
  rating_breakdown?: RatingBreakdown[];
  images?: { id: number; image: string; alt_text: string; order: number }[];
  reviews?: ProductReview[];
  related?: Product[];
};

export type SiteConfig = {
  whatsapp_number: string;
  contact_email: string;
  shipping_nearby_rate: string;
  shipping_other_rate: string;
  bank_details: {
    bank_name: string;
    account_title: string;
    account_number: string;
    iban: string;
    branch_code?: string;
  };
  nearby_cities?: string[];
  nearby_provinces?: string[];
  remote_cities?: string[];
  remote_provinces?: string[];
  remote_city_labels?: string[];
  nearby_city_labels?: string[];
};

export type OrderItem = {
  product_name: string;
  size_ml: string;
  quantity: number;
  price_at_purchase: string;
  line_total: string;
};

export type Order = {
  order_number: string;
  full_name: string;
  phone: string;
  city: string;
  address: string;
  payment_method: "cod" | "bank_transfer";
  payment_method_display?: string;
  status: string;
  status_display?: string;
  subtotal: string;
  shipping: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};

export const DEFAULT_WHATSAPP = "923177478167";
export const DEFAULT_EMAIL = "scentraryv@gmail.com";
export const WHATSAPP_DISPLAY = "+92 317 7478167";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string | null;
  stock: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function getApiUrl() {
  return API_URL.replace(/\/$/, "");
}

export async function fetchProducts(params?: {
  gender?: string;
  sort?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const sp = new URLSearchParams();
  if (params?.gender) sp.set("gender", params.gender);
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.featured) sp.set("featured", "1");
  const q = sp.toString();
  const res = await fetch(`${getApiUrl()}/api/store/products/${q ? `?${q}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${getApiUrl()}/api/store/products/${slug}/`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function fetchConfig(): Promise<SiteConfig> {
  const res = await fetch(`${getApiUrl()}/api/store/config/`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
}

export async function submitCheckout(formData: FormData) {
  const res = await fetch(`${getApiUrl()}/api/store/checkout/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as { order_number: string; total_amount: string };
}

export async function submitReturn(formData: FormData) {
  const res = await fetch(`${getApiUrl()}/api/store/returns/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as { success: boolean; message: string };
}

export async function submitReview(slug: string, formData: FormData) {
  const res = await fetch(`${getApiUrl()}/api/store/products/${slug}/reviews/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as {
    success: boolean;
    message: string;
    average_rating: number;
    review_count: number;
  };
}

export async function fetchOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${getApiUrl()}/api/store/orders/${orderNumber}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

/** Safe config loader: falls back to defaults when the API is unreachable. */
export async function fetchConfigSafe(): Promise<SiteConfig> {
  try {
    return await fetchConfig();
  } catch {
    return {
      whatsapp_number: DEFAULT_WHATSAPP,
      contact_email: DEFAULT_EMAIL,
      shipping_nearby_rate: "250.00",
      shipping_other_rate: "280.00",
      bank_details: { bank_name: "", account_title: "", account_number: "", iban: "" },
      nearby_cities: [],
      nearby_provinces: ["punjab", "panjab"],
      remote_cities: [],
      remote_provinces: [
        "sindh", "balochistan", "baluchistan", "kpk", "kp", "khyber", "pakhtunkhwa",
        "kashmir", "azad kashmir", "ajk", "gilgit", "baltistan", "gilgit baltistan",
      ],
      remote_city_labels: ["Karachi", "Quetta", "Gwadar", "Peshawar", "Muzaffarabad", "Mirpur", "Gilgit", "Skardu"],
      nearby_city_labels: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Islamabad"],
    };
  }
}

/** Collapse a DRF / Django-form error payload into a single readable string. */
export function errorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err) {
    const parts = Object.values(err as Record<string, unknown>).flat().filter(Boolean);
    if (parts.length) return parts.map(String).join(" ");
  }
  return fallback;
}

export function formatPrice(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `Rs. ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
