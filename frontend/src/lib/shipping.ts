/** Shipping helpers — live cities from /api/store/cities/ (Flaship Leopard). */

export const SHIPPING_FREE = 0;
/** Delivery charges for non–free cities (Punjab Leopard = free). */
export const SHIPPING_OTHER = 200;
export const OTHER_CITY_VALUE = "__other__";

export type ShippingCity = {
  id: number;
  name: string;
  normalized_name: string;
  has_leopard: boolean;
  is_punjab?: boolean;
  free_shipping?: boolean;
  shipping: string;
};

export function parseShippingAmount(value: string | number | undefined, fallback = SHIPPING_OTHER): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function hasFreeShipping(city: ShippingCity | null | undefined): boolean {
  if (!city) return false;
  if (typeof city.free_shipping === "boolean") return city.free_shipping;
  // Backward compat: old payloads used has_leopard alone
  return Boolean(city.has_leopard && city.is_punjab);
}

export function estimateShippingForCity(
  city: ShippingCity | null | undefined,
  isOther: boolean,
): number {
  if (!city || isOther) return SHIPPING_OTHER;
  if (hasFreeShipping(city)) return parseShippingAmount(city.shipping, SHIPPING_FREE);
  return parseShippingAmount(city.shipping, SHIPPING_OTHER);
}
