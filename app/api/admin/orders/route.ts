import { json, serverError } from "../../_lib/http";
import { listOrders } from "../../_lib/storage";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders — every order, newest first. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  try {
    return json(await listOrders());
  } catch (err) {
    return serverError("admin/orders", err);
  }
}
