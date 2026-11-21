export type Gender = "men" | "women" | "unisex";

export type Product = {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  price: number;
  sizeMl: string;
  shortDescription: string;
  description: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  noteChips: string[];
  inspiredBy: string;
  /** Original product photo (collection / shop / detail). */
  image: string;
  /** Transparent cutout for sticky scroll (page background shows through). */
  imageCutout: string;
  glow: string;
  bgWord: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const raw = [
  {
    id: "1",
    name: "Amition X",
    gender: "men" as const,
    price: 2000,
    sizeMl: "50ml",
    inspiredBy: "Dunhill Desire",
    shortDescription: "Apple, teak wood and warm vanilla musk.",
    description:
      "A bold amber-woody fragrance inspired by Dunhill Desire. Crisp apple and citrus open into teak wood and patchouli, finishing on warm vanilla musk — ambitious, refined, unforgettable.",
    topNotes: ["Apple", "Lemon", "Bergamot", "Orange Blossom"],
    heartNotes: ["Rose", "Teak Wood", "Patchouli"],
    baseNotes: ["Vanilla", "Musk"],
    noteChips: ["Apple", "Teak", "Vanilla Musk"],
    image: "/products/amition-x-main.jpg",
    imageCutout: "/products/amition-x-main.png",
    glow: "rgba(201, 162, 74, 0.45)",
    bgWord: "TEAK",
  },
  {
    id: "2",
    name: "Tazkiah",
    gender: "men" as const,
    price: 2500,
    sizeMl: "50ml",
    inspiredBy: "Marj",
    shortDescription: "Deep oud with honey, saffron and amber leather.",
    description:
      "A rich oriental-woody fragrance inspired by Marj. Spiced citrus and honey-oud open into saffron and florals, settling on amber leather and agarwood — powerful and refined.",
    topNotes: ["Bergamot", "Pink Pepper", "Honey", "Oud"],
    heartNotes: ["Saffron", "Cinnamon", "Rose", "Patchouli"],
    baseNotes: ["Agarwood", "Leather", "Amber", "Musk"],
    noteChips: ["Oud", "Honey", "Saffron", "Amber"],
    image: "/products/tazkiah-main.jpg",
    imageCutout: "/products/tazkiah-main.png",
    glow: "rgba(180, 90, 40, 0.5)",
    bgWord: "SAFFRON",
  },
  {
    id: "3",
    name: "Prime Ryv",
    gender: "men" as const,
    price: 2000,
    sizeMl: "50ml",
    inspiredBy: "Azzaro Wanted",
    shortDescription: "Lemon, ginger, cardamom, tonka and vetiver.",
    description:
      "A woody-spicy fragrance inspired by Azzaro Wanted. Sparkling lemon and ginger meet cardamom and apple, drying down to tonka and Haitian vetiver — modern and magnetic.",
    topNotes: ["Lemon", "Ginger", "Lavender", "Mint"],
    heartNotes: ["Apple", "Cardamom", "Juniper", "Geranium"],
    baseNotes: ["Tonka Bean", "Amberwood", "Haitian Vetiver"],
    noteChips: ["Lemon", "Ginger", "Cardamom", "Vetiver"],
    image: "/products/prime-ryv-main.jpg",
    imageCutout: "/products/prime-ryv-main.png",
    glow: "rgba(80, 160, 120, 0.45)",
    bgWord: "GINGER",
  },
  {
    id: "4",
    name: "Crush On You",
    gender: "women" as const,
    price: 2000,
    sizeMl: "50ml",
    inspiredBy: "VS Bombshell",
    shortDescription: "Passionfruit, peony and vanilla orchid.",
    description:
      "A bright fruity-floral inspired by Victoria's Secret Bombshell. Passionfruit and citrus bloom into peony and vanilla orchid, finishing on soft musk — flirty and irresistible.",
    topNotes: ["Passionfruit", "Citrus", "Grapefruit", "Pineapple"],
    heartNotes: ["Peony", "Vanilla Orchid", "Red Berries", "Jasmine"],
    baseNotes: ["Musk", "Soft Woods"],
    noteChips: ["Passionfruit", "Peony", "Vanilla Orchid"],
    image: "/products/crush-on-you-main.jpg",
    imageCutout: "/products/crush-on-you-main.png",
    glow: "rgba(220, 100, 140, 0.45)",
    bgWord: "PEONY",
  },
  {
    id: "5",
    name: "Eloura",
    gender: "women" as const,
    price: 2000,
    sizeMl: "50ml",
    inspiredBy: "Gucci Flora",
    shortDescription: "Pear blossom, gardenia and brown sugar.",
    description:
      "A luminous floral inspired by Gucci Flora Gorgeous Gardenia. Pear blossom and berries open into white gardenia and jasmine, finishing on brown sugar and patchouli.",
    topNotes: ["Pear Blossom", "Red Berries", "Italian Mandarin"],
    heartNotes: ["White Gardenia", "Jasmine Absolute", "Frangipani"],
    baseNotes: ["Brown Sugar", "Patchouli"],
    noteChips: ["Pear", "Gardenia", "Brown Sugar"],
    image: "/products/eloura-main.jpg",
    imageCutout: "/products/eloura-main.png",
    glow: "rgba(230, 180, 200, 0.4)",
    bgWord: "FLORA",
  },
  {
    id: "6",
    name: "AL-FAKHAMA",
    gender: "unisex" as const,
    price: 2500,
    sizeMl: "50ml",
    inspiredBy: "Oud Maracujá",
    shortDescription: "Passionfruit, saffron rose and smoky oud.",
    description:
      "A luxurious fruity-oud inspired by Oud Maracujá. Juicy passionfruit and saffron rose meet smoky agarwood, settling into leather, amber and vanilla — bold and exotic.",
    topNotes: ["Passionfruit", "Fruity Accords", "Saffron", "Turkish Rose"],
    heartNotes: ["Agarwood (Oud)", "Benzoin", "Patchouli"],
    baseNotes: ["Leather", "Amber", "Vanilla", "Labdanum"],
    noteChips: ["Passionfruit", "Saffron Rose", "Smoky Oud"],
    image: "/products/al-fakhama-main.jpg",
    imageCutout: "/products/al-fakhama-main.png",
    glow: "rgba(140, 60, 180, 0.45)",
    bgWord: "OUD",
  },
] as const;

/** Sticky scroll chapter order (matches design brief). */
export const SCROLL_ORDER = [
  "Amition X",
  "AL-FAKHAMA",
  "Prime Ryv",
  "Crush On You",
  "Eloura",
  "Tazkiah",
] as const;

export const products: Product[] = raw.map((p) => ({
  ...p,
  slug: slugify(p.name),
  topNotes: [...p.topNotes],
  heartNotes: [...p.heartNotes],
  baseNotes: [...p.baseNotes],
  noteChips: [...p.noteChips],
}));

export const scrollProducts: Product[] = SCROLL_ORDER.map(
  (name) => products.find((p) => p.name === name)!,
);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function genderLabel(g: Gender) {
  if (g === "men") return "For Him";
  if (g === "women") return "For Her";
  return "Unisex";
}
