import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase";
import type { User } from "@/lib/schema";

/**
 * Identity layer for the API: users, one-time codes, bearer-token sessions and
 * password hashing. Ported from the reference `server/storage.ts` +
 * `server/db.ts` (users / otp / sessions sections) and the Express
 * `attachUser` / `requireAuth` / `requireAdmin` middleware in
 * `server/routes.ts`.
 *
 * Every function goes through the service-role Supabase client, so it must only
 * ever be called from route handlers.
 */

/* ------------------------------- serialisers ------------------------------ */

type UserRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  password_hash: string | null;
  is_verified: number;
  is_admin: number;
  created_at: string;
};

const iso = (value: string | null): string | null =>
  value ? new Date(value).toISOString() : null;

export function mapUser(row: UserRow): User {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    passwordHash: row.password_hash,
    isVerified: Number(row.is_verified),
    isAdmin: Number(row.is_admin),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

/** Strip the password hash before anything leaves the server. */
export type PublicUser = Omit<User, "passwordHash">;
export function toPublicUser(u: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = u;
  return rest;
}

/* ---------------------------- password hashing ---------------------------- */

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string | null): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ---------------------------------- users --------------------------------- */

export async function getUser(id: number): Promise<User | undefined> {
  const { data } = await supabaseAdmin()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapUser(data as UserRow) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await supabaseAdmin()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ? mapUser(data as UserRow) : undefined;
}

export async function listCustomers(): Promise<PublicUser[]> {
  const { data } = await supabaseAdmin()
    .from("users")
    .select("*")
    .eq("is_admin", 0)
    .order("id", { ascending: false });
  return (data ?? []).map((row) => toPublicUser(mapUser(row as UserRow)));
}

export async function countCustomers(): Promise<number> {
  const { count } = await supabaseAdmin()
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("is_admin", 0);
  return count ?? 0;
}

/**
 * Create the customer record if it is new, otherwise fill in a name/phone we
 * did not have before — but never overwrite one the customer already gave us.
 */
export async function upsertUser(
  email: string,
  name: string,
  phone?: string | null,
): Promise<User> {
  const normalised = email.toLowerCase();
  const existing = await getUserByEmail(normalised);

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.name && name) patch.name = name;
    if (!existing.phone && phone) patch.phone = phone;
    if (Object.keys(patch).length) {
      const { data } = await supabaseAdmin()
        .from("users")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();
      if (data) return mapUser(data as UserRow);
    }
    return existing;
  }

  const { data, error } = await supabaseAdmin()
    .from("users")
    .insert({
      email: normalised,
      name: name || normalised.split("@")[0],
      phone: phone ?? null,
      is_verified: 0,
      is_admin: 0,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    // Lost a race with a concurrent insert on the unique email index.
    const raced = await getUserByEmail(normalised);
    if (raced) return raced;
    throw error ?? new Error("Could not create the customer record.");
  }
  return mapUser(data as UserRow);
}

export async function markVerified(id: number): Promise<void> {
  await supabaseAdmin().from("users").update({ is_verified: 1 }).eq("id", id);
}

export async function updateProfile(
  id: number,
  patch: { name?: string; phone?: string; address?: string },
): Promise<User | undefined> {
  const clean: Record<string, unknown> = {};
  if (patch.name) clean.name = patch.name;
  if (patch.phone !== undefined) clean.phone = patch.phone;
  if (patch.address !== undefined) clean.address = patch.address;
  if (!Object.keys(clean).length) return getUser(id);

  const { data } = await supabaseAdmin()
    .from("users")
    .update(clean)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  return data ? mapUser(data as UserRow) : undefined;
}

/* --------------------------------- admin ---------------------------------- */

export const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

/**
 * The Express build seeded the admin account on boot (`seedDatabase`). There is
 * no boot step on serverless, so the account is reconciled from the environment
 * on the first admin login attempt instead: created if missing, and its hash
 * re-synced whenever ADMIN_PASSWORD changes.
 */
export async function ensureAdminAccount(): Promise<void> {
  if (!ADMIN_LOGIN_EMAIL || !ADMIN_LOGIN_PASSWORD) {
    throw new Error("Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  }
  const existing = await getUserByEmail(ADMIN_LOGIN_EMAIL);

  if (!existing) {
    await supabaseAdmin()
      .from("users")
      .insert({
        email: ADMIN_LOGIN_EMAIL,
        name: "Insaf Mart Admin",
        phone: null,
        password_hash: hashPassword(ADMIN_LOGIN_PASSWORD),
        is_verified: 1,
        is_admin: 1,
        created_at: new Date().toISOString(),
      });
    console.log(`[seed] admin account created for ${ADMIN_LOGIN_EMAIL}`);
    return;
  }

  const needsPatch =
    existing.isAdmin !== 1 ||
    existing.isVerified !== 1 ||
    !verifyPassword(ADMIN_LOGIN_PASSWORD, existing.passwordHash);

  if (needsPatch) {
    await supabaseAdmin()
      .from("users")
      .update({
        is_admin: 1,
        is_verified: 1,
        password_hash: hashPassword(ADMIN_LOGIN_PASSWORD),
      })
      .eq("id", existing.id);
  }
}

export async function verifyAdminLogin(
  email: string,
  password: string,
): Promise<User | undefined> {
  await ensureAdminAccount();
  const user = await getUserByEmail(email);
  if (!user || !user.isAdmin || !user.passwordHash) return undefined;
  return verifyPassword(password, user.passwordHash) ? user : undefined;
}

/* ----------------------------------- otp ---------------------------------- */

/** Invalidates any outstanding codes for the address, then issues a new one. */
export async function createOtp(email: string): Promise<string> {
  const normalised = email.toLowerCase();
  const db = supabaseAdmin();

  await db.from("otp_codes").update({ consumed: 1 }).eq("email", normalised);

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.from("otp_codes").insert({
    email: normalised,
    code,
    expires_at: Date.now() + 10 * 60 * 1000,
    consumed: 0,
  });
  return code;
}

export async function consumeOtp(email: string, code: string): Promise<boolean> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("otp_codes")
    .select("id")
    .eq("email", email.toLowerCase())
    .eq("code", code.trim())
    .eq("consumed", 0)
    .gt("expires_at", Date.now())
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  await db.from("otp_codes").update({ consumed: 1 }).eq("id", (data as { id: number }).id);
  return true;
}

/* -------------------------------- sessions -------------------------------- */

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await supabaseAdmin()
    .from("sessions")
    .insert({ token, user_id: userId, created_at: new Date().toISOString() });
  return token;
}

export async function getSessionUser(token: string): Promise<User | undefined> {
  if (!token) return undefined;
  const { data } = await supabaseAdmin()
    .from("sessions")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();
  if (!data) return undefined;
  return getUser(Number((data as { user_id: number }).user_id));
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  await supabaseAdmin().from("sessions").delete().eq("token", token);
}

/* --------------------------- request-level helpers ------------------------ */

/** `Authorization: Bearer <token>` → token, or "". */
export function bearerToken(req: Request): string {
  const header = req.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/** The signed-in user for a request, or undefined. Never throws. */
export async function resolveUser(req: Request): Promise<User | undefined> {
  const token = bearerToken(req);
  if (!token) return undefined;
  return getSessionUser(token);
}

export type AuthFailure = { user?: undefined; response: Response };
export type AuthSuccess = { user: User; response?: undefined };
export type AuthResult = AuthSuccess | AuthFailure;

const deny = (message: string, status: number): AuthFailure => ({
  response: new Response(JSON.stringify({ message }), {
    status,
    headers: { "content-type": "application/json" },
  }),
});

/** 401 `{ message: "Please sign in to continue." }` when not signed in. */
export async function requireUser(req: Request): Promise<AuthResult> {
  const user = await resolveUser(req);
  if (!user) return deny("Please sign in to continue.", 401);
  return { user };
}

/**
 * 401 when not signed in, 403 `{ message: "Administrator access required." }`
 * when signed in without the admin flag.
 */
export async function requireAdmin(req: Request): Promise<AuthResult> {
  const user = await resolveUser(req);
  if (!user) return deny("Please sign in to continue.", 401);
  if (!user.isAdmin) return deny("Administrator access required.", 403);
  return { user };
}
