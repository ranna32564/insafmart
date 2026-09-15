import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import { createOtp, upsertUser } from "@/lib/api-auth";
import { MAIL_ENABLED, sendOtpEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const requestOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Very small fixed-window rate limiter, ported from `server/routes.ts`. Keeps a
 * stray script from burning through the Gmail sending quota. In-memory, so on
 * serverless it is per-instance.
 */
const otpHits = new Map<string, { count: number; resetAt: number }>();
function otpRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = otpHits.get(key);
  if (!entry || now > entry.resetAt) {
    otpHits.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

/** POST /api/auth/request-otp */
export async function POST(req: Request) {
  const parsed = requestOtpSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const { email, name, phone } = parsed.data;

  if (otpRateLimited(email.toLowerCase())) {
    return fail("Too many code requests. Please wait 10 minutes and try again.", 429);
  }

  try {
    const user = await upsertUser(email, name ?? "", phone ?? null);
    const code = await createOtp(email);
    const result = await sendOtpEmail(email, code);

    return json({
      message: result.delivered
        ? `We sent a 6-digit code to ${email}.`
        : `Preview mode — no email service is configured, so the code is shown below.`,
      emailDelivered: result.delivered,
      isNewAccount: user.isVerified === 0,
      // Only ever exposed when SMTP is not configured, so the preview is usable.
      previewCode: MAIL_ENABLED ? undefined : code,
    });
  } catch (err) {
    return serverError("auth/request-otp", err);
  }
}
