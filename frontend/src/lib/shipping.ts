/**
 * Mirror of store/shipping.py so cart & checkout totals match the backend.
 */
export const FALLBACK_NEARBY_PROVINCES = ["punjab", "panjab"];

export const FALLBACK_REMOTE_PROVINCES = [
  "sindh",
  "balochistan",
  "baluchistan",
  "kpk",
  "kp",
  "khyber",
  "pakhtunkhwa",
  "khyber pakhtunkhwa",
  "kashmir",
  "azad kashmir",
  "ajk",
  "muzaffarabad",
  "gilgit",
  "baltistan",
  "gilgit baltistan",
  "gb",
];

export const FALLBACK_NEARBY_CITIES = [
  "lahore", "faisalabad", "rawalpindi", "islamabad", "isb", "multan", "gujranwala",
  "sialkot", "bahawalpur", "sargodha", "sahiwal", "sheikhupura", "rahim yar khan",
  "gujrat", "jhelum", "kasur", "okara", "vehari", "khanewal", "muzaffargarh",
  "dera ghazi khan", "dg khan", "bahawalnagar", "chiniot", "jhang", "toba tek singh",
  "hafizabad", "nankana sahib", "narowal", "mandi bahauddin", "mianwali", "bhakkar",
  "khushab", "chakwal", "attock", "murree",
];

export const FALLBACK_REMOTE_CITIES = [
  "karachi", "hyderabad", "sukkur", "larkana", "tharparkar", "mithi",
  "quetta", "gwadar", "turbat", "khuzdar", "chaman", "panjgur", "loralai",
  "peshawar", "mardan", "abbottabad", "swat", "mingora", "kohat", "bannu",
  "muzaffarabad", "mirpur", "kotli", "rawalakot", "bagh", "bhimber",
  "gilgit", "skardu", "hunza", "astore", "chilas",
];

export function normalizeCity(city: string) {
  return (city || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordMatch(name: string, keywords: string[]) {
  const tokens = name.split(" ");
  return keywords.some((keyword) =>
    keyword.includes(" ") ? name.includes(keyword) : tokens.includes(keyword),
  );
}

function placeMatch(name: string, places: string[]) {
  if (places.includes(name)) return true;
  const tokens = name.split(" ");
  if (tokens.some((token) => places.includes(token))) return true;
  const compactName = name.replace(/\s+/g, "");
  return places.some((place) => {
    if (place.includes(" ") && name.includes(place)) return true;
    const compact = place.replace(/\s+/g, "");
    return compact.length >= 5 && compactName.includes(compact);
  });
}

export function isNearbyCity(
  city: string,
  nearbyCities: string[] = FALLBACK_NEARBY_CITIES,
  address = "",
  nearbyProvinces: string[] = FALLBACK_NEARBY_PROVINCES,
) {
  const name = [normalizeCity(city), normalizeCity(address)].filter(Boolean).join(" ");
  if (!name) return false;
  return keywordMatch(name, nearbyProvinces) || placeMatch(name, nearbyCities);
}

export function isRemoteCity(
  city: string,
  remoteCities: string[] = FALLBACK_REMOTE_CITIES,
  address = "",
  remoteProvinces: string[] = FALLBACK_REMOTE_PROVINCES,
  nearbyCities: string[] = FALLBACK_NEARBY_CITIES,
  nearbyProvinces: string[] = FALLBACK_NEARBY_PROVINCES,
) {
  const name = [normalizeCity(city), normalizeCity(address)].filter(Boolean).join(" ");
  if (!name) return false;

  if (isNearbyCity(city, nearbyCities, address, nearbyProvinces)) {
    return false;
  }

  // Known remote OR any unknown village outside Punjab → remote rate
  void remoteCities;
  void remoteProvinces;
  return true;
}

export function calculateShipping(
  quantity: number,
  city: string,
  rates: { nearby: number; remote: number },
  remoteCities?: string[],
  address = "",
  remoteProvinces?: string[],
  nearbyCities?: string[],
  nearbyProvinces?: string[],
) {
  if (quantity <= 0) return 0;
  return isRemoteCity(
    city,
    remoteCities && remoteCities.length ? remoteCities : undefined,
    address,
    remoteProvinces && remoteProvinces.length ? remoteProvinces : undefined,
    nearbyCities && nearbyCities.length ? nearbyCities : undefined,
    nearbyProvinces && nearbyProvinces.length ? nearbyProvinces : undefined,
  )
    ? rates.remote
    : rates.nearby;
}
