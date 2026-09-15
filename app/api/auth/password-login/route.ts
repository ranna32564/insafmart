import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import {
  createSession,
  getUser,
  getUserByEmail,
  toPublicUser,
  verifyPassword,
} from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const loginHits = new Map<string, { count: number; resetAt: number }>();

function loginRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = loginHits.get(key);
  if (!entry || now > entry.resetAt) {
    loginHits.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const { email, password } = parsed.data;
  const normalised = email.toLowerCase().trim();

  if (loginRateLimited(normalised)) {
    return fail(
      "Too many login attempts. Please wait 10 minutes and try again.",
      429,
    );
  }

  try {
    const user = await getUserByEmail(normalised);

    // Generic error — never reveal whether the email exists
    const INVALID = "Email or password is incorrect.";

    if (!user) return fail(INVALID, 401);
    if (!user.passwordHash) return fail(INVALID, 401);
    if (user.isVerified !== 1) {
      return fail(
        "This account is not verified yet. Please complete registration first.",
        403,
      );
    }

    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) return fail(INVALID, 401);

    const token = await createSession(user.id);
    const fresh = (await getUser(user.id))!;

    return json({
      token,
      user: toPublicUser(fresh),
    });
  } catch (err) {
    return serverError("auth/password-login", err);
  }
}