import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import { requireUser, toPublicUser, updateProfile } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

/** PATCH /api/auth/profile */
export async function PATCH(req: Request) {
  const auth = await requireUser(req);
  if (auth.response) return auth.response;

  const parsed = profileSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const updated = await updateProfile(auth.user.id, parsed.data);
    if (!updated) return fail("Account not found.", 404);
    return json(toPublicUser(updated));
  } catch (err) {
    return serverError("auth/profile", err);
  }
}
