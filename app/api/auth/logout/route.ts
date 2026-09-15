import { json, serverError } from "../../_lib/http";
import { bearerToken, destroySession } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — deletes the session row. Always `{ ok: true }`. */
export async function POST(req: Request) {
  try {
    const token = bearerToken(req);
    if (token) await destroySession(token);
    return json({ ok: true });
  } catch (err) {
    return serverError("auth/logout", err);
  }
}
