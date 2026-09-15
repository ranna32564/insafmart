import { json, serverError } from "../../_lib/http";
import { stats } from "../../_lib/storage";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/stats */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  try {
    return json(await stats());
  } catch (err) {
    return serverError("admin/stats", err);
  }
}
