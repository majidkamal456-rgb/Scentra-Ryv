/** Shipping helpers — live cities from /api/store/cities/ (Flaship). */

export const SHIPPING_FREE = 0;
/** Delivery charges outside free Leopard ~181 DC zone. */
export const SHIPPING_OTHER = 200;

export type ShippingCity = {
  id: number;
  name: string;
  normalized_name: string;
  has_leopard: boolean;
  is_punjab?: boolean;
  free_shipping?: boolean;
  shipping: string;
  courier_dc?: string | null;
};

export function parseShippingAmount(value: string | number | undefined, fallback = SHIPPING_OTHER): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function hasFreeShipping(city: ShippingCity | null | undefined): boolean {
  if (!city) return false;
  if (typeof city.free_shipping === "boolean") return city.free_shipping;
  return Boolean(city.has_leopard && city.is_punjab);
}

export function estimateShippingForCity(city: ShippingCity | null | undefined): number {
  if (!city) return SHIPPING_OTHER;
  if (hasFreeShipping(city)) return parseShippingAmount(city.shipping, SHIPPING_FREE);
  return parseShippingAmount(city.shipping, SHIPPING_OTHER);
}

function compact(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 3) return 99;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

/** Score a city against query — higher is better. 0 = no match. */
export function cityMatchScore(city: ShippingCity, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const name = (city.name || "").toLowerCase();
  const norm = (city.normalized_name || name).toLowerCase();
  const qc = compact(q);
  const nc = compact(norm);
  const namc = compact(name);

  if (name === q || norm === q) return 1000;
  if (name.startsWith(q) || norm.startsWith(q)) return 900 - Math.min(name.length, 80);
  if (namc.startsWith(qc) || nc.startsWith(qc)) return 850 - Math.min(nc.length, 80);
  if (name.includes(q) || norm.includes(q)) return 700 - name.indexOf(q);
  if (namc.includes(qc) || nc.includes(qc)) return 650;

  // Word-prefix: "lah" → "Lahore"
  for (const part of norm.split(/\s+/)) {
    if (part.startsWith(q)) return 600;
  }

  // Typo tolerance (queta → quetta, islambad → islamabad)
  if (qc.length >= 3) {
    const dist = Math.min(editDistance(qc, nc), editDistance(qc, namc));
    const maxDist = qc.length <= 4 ? 1 : qc.length <= 7 ? 2 : 3;
    if (dist <= maxDist) return 500 - dist * 40;
  }

  return 0;
}

export function cityMatchesQuery(city: ShippingCity, query: string): boolean {
  return cityMatchScore(city, query) > 0;
}

/**
 * Flaship-style ranked city suggestions.
 * Empty query → alphabetical list. Typed query → fuzzy / typo matches first.
 */
export function suggestCities(
  cities: ShippingCity[],
  query: string,
  limit = 80,
): ShippingCity[] {
  const q = query.trim();
  if (!q) {
    return [...cities]
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }))
      .slice(0, limit);
  }

  const scored: Array<{ city: ShippingCity; score: number }> = [];
  for (const city of cities) {
    const score = cityMatchScore(city, q);
    if (score > 0) scored.push({ city, score });
  }
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.city.name || "").localeCompare(b.city.name || "", undefined, { sensitivity: "base" });
  });
  return scored.slice(0, limit).map((s) => s.city);
}
