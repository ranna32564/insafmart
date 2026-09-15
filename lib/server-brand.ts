/**
 * Server-side source of truth for the store's contact, payment and delivery
 * rules. Ported verbatim from the reference `server/brand.ts` — this exact
 * object is what `GET /api/config` returns as `brand`, so the shape must not
 * drift. The client mirror lives in `lib/brand.ts`; keep both in sync.
 */
export const BRAND = {
  name: "Insaf Mart",
  email: "admininsafmart@gmail.com",
  whatsapp: ["01601600289", "01601772897"] as const,
  bkash: "01736909636",
  nagad: "01737131591",
  /** Delivery charges in BDT. */
  shipping: {
    insideDhaka: 120,
    outsideDhaka: 140,
    freeAbove: 3000,
  },
} as const;

const DHAKA_KEYS = [
  "dhaka",
  "ঢাকা",
  "gulshan",
  "banani",
  "dhanmondi",
  "mirpur",
  "uttara",
  "mohakhali",
  "bashundhara",
  "badda",
  "motijheel",
  "tejgaon",
  "rampura",
  "khilgaon",
  "mohammadpur",
  "shyamoli",
  "farmgate",
  "banasree",
];

export function isInsideDhaka(city: string): boolean {
  const c = (city || "").trim().toLowerCase();
  return DHAKA_KEYS.some((k) => c.includes(k));
}

/** Server-authoritative delivery charge — never trust a client-sent value. */
export function calcShipping(subtotal: number, city: string): number {
  if (subtotal >= BRAND.shipping.freeAbove) return 0;
  return isInsideDhaka(city) ? BRAND.shipping.insideDhaka : BRAND.shipping.outsideDhaka;
}

/** Order statuses that count as money we can bank. */
export const REVENUE_STATUSES = ["confirmed", "shipped", "delivered"] as const;
