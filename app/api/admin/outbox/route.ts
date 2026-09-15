import { json } from "../../_lib/http";
import { requireAdmin } from "@/lib/api-auth";
import { MAIL_ENABLED, outbox } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/** GET /api/admin/outbox — the in-memory preview outbox (last 50 messages). */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  return json({ mailEnabled: MAIL_ENABLED, messages: outbox });
}
