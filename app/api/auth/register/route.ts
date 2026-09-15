import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../_lib/http";
import { createOtp, getUserByEmail } from "@/lib/api-auth";
import { MAIL_ENABLED, sendOtpEmail } from "@/lib/mailer";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Registration schema — only Gmail addresses allowed.
 * Requires name, gmail, password and password confirmation.
 */
const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name").max(80),
    email: z
      .string()
      .email("Enter a valid email address")
      .refine(
        (val) => /@gmail\.com$/i.test(val.trim()),
        "Only Gmail addresses are accepted (e.g. yourname@gmail.com)",
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

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

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const { email, name, password } = parsed.data;
  const normalised = email.toLowerCase().trim();

  if (otpRateLimited(normalised)) {
    return fail(
      "Too many code requests. Please wait 10 minutes and try again.",
      429,
    );
  }

  try {
    // Check if a verified account already exists with this email
    const existing = await getUserByEmail(normalised);
    if (existing && existing.isVerified === 1 && existing.passwordHash) {
      return fail(
        "An account with this email already exists. Please log in instead.",
        400,
      );
    }

    // Store the password hash temporarily on the otp_codes table? No —
    // we use a separate "pending_registrations" pattern via otp_codes metadata.
    // Simpler approach: store hash in users row now, but keep is_verified = 0
    // until OTP is confirmed.
    const { hashPassword } = await import("@/lib/api-auth");
    const passwordHash = hashPassword(password);

    if (existing) {
      // Update existing unverified row with new name + password
      await supabaseAdmin()
        .from("users")
        .update({
          name: name || existing.name,
          password_hash: passwordHash,
          is_verified: 0,
        })
        .eq("id", existing.id);
    } else {
      // Create a fresh unverified user row
      const { error } = await supabaseAdmin()
        .from("users")
        .insert({
          email: normalised,
          name,
          password_hash: passwordHash,
          is_verified: 0,
          is_admin: 0,
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
    }

    // Generate + send OTP
    const code = await createOtp(normalised);
    const result = await sendOtpEmail(normalised, code);

    return json({
      message: result.delivered
        ? `We sent a 6-digit code to ${email}.`
        : `Preview mode — no email service configured, code is shown below.`,
      emailDelivered: result.delivered,
      previewCode: MAIL_ENABLED ? undefined : code,
    });
  } catch (err) {
    return serverError("auth/register", err);
  }
}