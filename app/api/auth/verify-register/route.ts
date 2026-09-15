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

const verifyRegisterSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6, "Enter the 6-digit code").max(6),
});

export async function POST(req: Request) {
  const parsed = verifyRegisterSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const { email, code } = parsed.data;
  const normalised = email.toLowerCase().trim();

  try {
    // Verify OTP
    const ok = await consumeOtp(normalised, code);
    if (!ok) {
      return fail("That code is wrong or has expired. Request a new one.", 400);
    }

    const user = await getUserByEmail(normalised);
    if (!user) {
      return fail(
        "No pending registration found for this email. Please register again.",
        400,
      );
    }

    if (!user.passwordHash) {
      return fail(
        "Registration is incomplete. Please register again with a password.",
        400,
      );
    }

    // Mark the user as verified
    await markVerified(user.id);

    // Create session so they are logged in automatically
    const token = await createSession(user.id);
    const fresh = (await getUser(user.id))!;

    return json({
      token,
      user: toPublicUser(fresh),
      message: "Account created successfully.",
    });
  } catch (err) {
    return serverError("auth/verify-register", err);
  }
}