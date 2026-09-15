import { json } from "../_lib/http";
import { BRAND, calcShipping, isInsideDhaka } from "@/lib/server-brand";

export const dynamic = "force-dynamic";

/** GET /api/shipping-quote?subtotal=&city= — server-authoritative delivery charge. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const subtotal = Number(url.searchParams.get("subtotal") || 0);
  const city = String(url.searchParams.get("city") || "");

  return json({
    shipping: calcShipping(subtotal, city),
    insideDhaka: isInsideDhaka(city),
    freeAbove: BRAND.shipping.freeAbove,
  });
}
