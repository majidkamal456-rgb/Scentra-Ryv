/** Site reviews — shared by home testimonials slider + product pages. */
export type Review = {
  id: string;
  productSlug: string;
  productName: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
};

export const reviews: Review[] = [
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
  {
    id: "r4",
    productSlug: "al-fakhama",
    productName: "AL-FAKHAMA",
    name: "Fatima Z.",
    city: "Multan",
    rating: 5,
    comment:
      "AL-FAKHAMA is rich and long-lasting. Unisex but I wear it confidently. Customer support on WhatsApp was quick.",
  },
  {
    id: "r5",
    productSlug: "prime-ryv",
    productName: "Prime Ryv",
    name: "Bilal A.",
    city: "Faisalabad",
    rating: 5,
    comment:
      "Prime Ryv gets compliments every time. Ordered Tazkiah next — Scentra Ryv is my go-to for fragrance now.",
  },
  {
    id: "r6",
    productSlug: "tazkiah",
    productName: "Tazkiah",
    name: "Omar S.",
    city: "Rawalpindi",
    rating: 5,
    comment:
      "Tazkiah has serious presence — oud and saffron done right. Lasts well in the heat.",
  },
  {
    id: "r7",
    productSlug: "eloura",
    productName: "Eloura",
    name: "Maryam N.",
    city: "Peshawar",
    rating: 5,
    comment:
      "Received so many compliments on Eloura. Soft gardenia that feels expensive.",
  },
  {
    id: "r8",
    productSlug: "amition-x",
    productName: "Amition X",
    name: "Usman R.",
    city: "Hyderabad",
    rating: 4,
    comment:
      "Very close to Dunhill Desire vibe. Bottle looks premium for the price.",
  },
  {
    id: "r9",
    productSlug: "crush-on-you",
    productName: "Crush On You",
    name: "Hina F.",
    city: "Sialkot",
    rating: 5,
    comment:
      "My new favourite. Fresh, flirty, and the COD experience was smooth.",
  },
  {
    id: "r10",
    productSlug: "al-fakhama",
    productName: "AL-FAKHAMA",
    name: "Zain A.",
    city: "Quetta",
    rating: 5,
    comment:
      "Smoky oud with a juicy opening — unique in my collection. Will reorder.",
  },
];

export function getReviewsForProduct(slug: string) {
  return reviews.filter((r) => r.productSlug === slug);
}

export function getHomeReviews() {
  return reviews;
}
