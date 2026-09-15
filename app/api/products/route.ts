import { json, serverError } from "../_lib/http";
import { listProducts } from "../_lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/products — full catalog, featured first. */
export async function GET() {
  try {
    return json(await listProducts());
  } catch (err) {
    return serverError("products", err);
  }
}
