import { json, serverError } from "../../_lib/http";
import { listOrdersByEmail } from "../../_lib/storage";
import { listCustomers, requireAdmin, type PublicUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/customers — customers with their order count and spend. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  try {
    const rows = await listCustomers();
    const customers: (PublicUser & { orderCount: number; spent: number })[] =
      await Promise.all(
        rows.map(async (c) => {
          const theirs = await listOrdersByEmail(c.email);
          return {
            ...c,
            orderCount: theirs.length,
            spent: theirs
              .filter((o) => ["confirmed", "shipped", "delivered"].includes(o.status))
              .reduce((sum, o) => sum + o.total, 0),
          };
        }),
      );
    return json(customers);
  } catch (err) {
    return serverError("admin/customers", err);
  }
}
