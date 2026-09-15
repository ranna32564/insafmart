/** Contact + payment details. Mirrors `server/brand.ts` — keep both in sync. */
export const BRAND = {
  name: "Insaf Mart",
  tagline: "Attar · Beauty · Gifts",
  email: "admininsafmart@gmail.com",
  whatsapp: [
    { number: "01601600289", label: "Orders & general" },
    { number: "01601772897", label: "Support & tracking" },
  ],
  bkash: "01736909636",
  nagad: "01737131591",
  shipping: { insideDhaka: 120, outsideDhaka: 140, freeAbove: 3000 },
} as const;

/** 01601600289 → 8801601600289 for wa.me links */
export function waLink(number: string, message?: string) {
  const intl = `88${number.replace(/\D/g, "")}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${intl}${text}`;
}

export const CATEGORY_META = [
  {
    slug: "fragrance",
    label: "Fragrance & Attar",
    tagline: "Oud, musk, amber",
    image: "./images/cat-fragrance.webp",
  },
  {
    slug: "skincare",
    label: "Skincare & Beauty",
    tagline: "Glow, tint, care",
    image: "./images/cat-skincare.webp",
  },
  {
    slug: "haircare",
    label: "Hair Care & Accessories",
    tagline: "Silk, satin, styling",
    image: "./images/cat-haircare.webp",
  },
  {
    slug: "fashion",
    label: "Fashion & Lifestyle",
    tagline: "Jewellery, bags, watches",
    image: "./images/cat-fashion.webp",
  },
  {
    slug: "gifts",
    label: "Accessories & Gifts",
    tagline: "Boxes for every occasion",
    image: "./images/cat-gifts.webp",
  },
] as const;

export type CategorySlug = (typeof CATEGORY_META)[number]["slug"];

export function categoryLabel(slug: string) {
  return CATEGORY_META.find((c) => c.slug === slug)?.label ?? slug;
}

/** ৳1,250 */
export function taka(amount: number) {
  return `৳${Math.round(amount).toLocaleString("en-BD")}`;
}

export const STATUS_META: Record<
  string,
  { label: string; tone: "amber" | "green" | "blue" | "red" | "grey" }
> = {
  pending_verification: { label: "Pending verification", tone: "amber" },
  pending: { label: "Pending (COD)", tone: "blue" },
  confirmed: { label: "Confirmed", tone: "green" },
  shipped: { label: "Shipped", tone: "blue" },
  delivered: { label: "Delivered", tone: "green" },
  rejected: { label: "Payment rejected", tone: "red" },
  cancelled: { label: "Cancelled", tone: "grey" },
};

export const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash (advance)",
  nagad: "Nagad (advance)",
};
