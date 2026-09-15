import { fail, json, serverError } from "../../_lib/http";
import { getProductBySlug } from "../../_lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/products/:slug */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return fail("Product not found.", 404);
    return json(product);
  } catch (err) {
    return serverError("products/:slug", err);
  }
}
