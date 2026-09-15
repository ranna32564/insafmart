import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import { createSession, toPublicUser, verifyAdminLogin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

/** POST /api/auth/admin-login — email + password from ADMIN_EMAIL / ADMIN_PASSWORD. */
export async function POST(req: Request) {
  const parsed = adminLoginSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const user = await verifyAdminLogin(parsed.data.email, parsed.data.password);
    if (!user) return fail("Incorrect email or password.", 401);

    const token = await createSession(user.id);
    return json({ token, user: toPublicUser(user) });
  } catch (err) {
    return serverError("auth/admin-login", err);
  }
}
