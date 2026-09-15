import { fail, json, serverError } from "../../_lib/http";
import { resolveUser, toPublicUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/me — the bearer token's user, or 401. */
export async function GET(req: Request) {
  try {
    const user = await resolveUser(req);
    if (!user) return fail("Not signed in.", 401);
    return json(toPublicUser(user));
  } catch (err) {
    return serverError("auth/me", err);
  }
}
