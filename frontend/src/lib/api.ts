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
  images?: { id: number; image: string; alt_text: string; order: number }[];
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
};

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
    next: { revalidate: 60 },
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

export async function fetchOrder(orderNumber: string) {
  const res = await fetch(`${getApiUrl()}/api/store/orders/${orderNumber}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export function formatPrice(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `Rs. ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
