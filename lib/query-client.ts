"use client";

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { safeStorage } from "./safe-storage";

/* -------------------------------------------------------------------------- */
/* Auth token                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Web storage is blocked in sandboxed preview iframes, so the token lives in a
 * module variable and is mirrored through `safeStorage` on a best-effort basis.
 */
const TOKEN_KEY = "insaf_mart_token";
let authToken: string | null = safeStorage.get(TOKEN_KEY);

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) safeStorage.set(TOKEN_KEY, token);
  else safeStorage.remove(TOKEN_KEY);
}

function authHeaders(base: Record<string, string> = {}) {
  return authToken ? { ...base, Authorization: `Bearer ${authToken}` } : base;
}

/* -------------------------------------------------------------------------- */

/** Pull the human-readable `message` out of an API error body. */
async function throwIfResNotOk(res: Response) {
  if (res.ok) return;
  const text = (await res.text()) || res.statusText;
  let message = text;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.message === "string") message = parsed.message;
  } catch {
    /* not JSON — use the raw text */
  }
  const error = new Error(message) as Error & { status?: number };
  error.status = res.status;
  throw error;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: authHeaders(data ? { "Content-Type": "application/json" } : {}),
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/"), {
      cache: "no-store",
      headers: authHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
