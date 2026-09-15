import { randomInt } from "node:crypto";

import { getOrderByNumber } from "./storage";

/**
 * IM-260911-4821 — `IM-YYMMDD-NNNN`. Retries on collision, then falls back to a
 * timestamp tail. Ported from `generateOrderNumber` in `server/routes.ts`.
 */
export async function generateOrderNumber(): Promise<string> {
  const d = new Date();
  const stamp =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `IM-${stamp}-${String(randomInt(1000, 10000))}`;
    if (!(await getOrderByNumber(candidate))) return candidate;
  }
  return `IM-${stamp}-${Date.now().toString().slice(-5)}`;
}
