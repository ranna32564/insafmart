import { json, serverError } from "../../_lib/http";
import { listOrdersByEmail, listOrdersByUserId } from "../../_lib/storage";
import { requireUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if (auth.response) return auth.response;

  try {
    const byUserId = await listOrdersByUserId(auth.user.id);
    const byEmail = await listOrdersByEmail(auth.user.email);

    const seen = new Set<number>();
    const merged = [...byUserId, ...byEmail].filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });

    merged.sort((a, b) => b.id - a.id);

    return json(merged);
  } catch (err) {
    return serverError("orders/mine", err);
  }
}
