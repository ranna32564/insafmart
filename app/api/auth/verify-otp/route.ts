import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import {
  consumeOtp,
  createSession,
  getUser,
  getUserByEmail,
  markVerified,
  toPublicUser,
} from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6, "Enter the 6-digit code").max(6),
});

/** POST /api/auth/verify-otp — consumes the code and issues a bearer token. */
export async function POST(req: Request) {
  const parsed = verifyOtpSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const { email, code } = parsed.data;

  try {
    if (!(await consumeOtp(email, code))) {
      return fail("That code is wrong or has expired. Request a new one.", 400);
    }

    const user = await getUserByEmail(email);
    if (!user) return fail("Account not found.", 400);

    await markVerified(user.id);
    const token = await createSession(user.id);
    const fresh = (await getUser(user.id))!;

    return json({ token, user: toPublicUser(fresh) });
  } catch (err) {
    return serverError("auth/verify-otp", err);
  }
}
