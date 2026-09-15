import { NextResponse } from "next/server";
import { fromError } from "zod-validation-error";

/**
 * Response helpers shared by every route handler, so status codes and error
 * bodies stay byte-identical to the Express build (`server/routes.ts`).
 */

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

/** `{ message }` with the given status — the only error shape the API emits. */
export function fail(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/** 400 with the same human-readable zod message the Express build produced. */
export function badRequest(err: unknown) {
  return NextResponse.json({ message: fromError(err).toString() }, { status: 400 });
}

/** Parses a JSON body, tolerating an empty one (Express gave `{}`). */
export async function readJson(req: Request): Promise<unknown> {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/** `Number(param)` guarded exactly like the Express handlers. */
export function numericId(raw: string): number {
  return Number(raw);
}

/** Unexpected failures: log server-side, return a generic 500. */
export function serverError(scope: string, err: unknown) {
  console.error(`[api:${scope}]`, err);
  return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
}
