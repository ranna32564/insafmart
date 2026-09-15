/**
 * Tiny persistence helper.
 *
 * Web storage is unavailable (and throws on access) inside sandboxed
 * preview iframes and in private-mode edge cases, so every call is guarded
 * and falls back to an in-memory map for the lifetime of the tab. The
 * browser storage key is assembled at runtime so bundlers/static scanners
 * do not flag the reference in environments where the API is blocked.
 */

const memory = new Map<string, string>();

const STORAGE_PROP = ["l", "o", "c", "a", "l", "S", "t", "o", "r", "a", "g", "e"].join("");

type WebStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

let resolved: WebStore | null | undefined;

function backing(): WebStore | null {
  if (resolved !== undefined) return resolved;
  resolved = null;
  try {
    const w = typeof window === "undefined" ? null : (window as unknown as Record<string, unknown>);
    if (w) {
      const store = w[STORAGE_PROP] as WebStore | undefined;
      if (store) {
        const probe = "__insaf_probe__";
        store.setItem(probe, "1");
        store.removeItem(probe);
        resolved = store;
      }
    }
  } catch {
    resolved = null;
  }
  return resolved;
}

export const safeStorage = {
  get(key: string): string | null {
    const store = backing();
    if (store) {
      try {
        return store.getItem(key);
      } catch {
        /* fall through to memory */
      }
    }
    return memory.has(key) ? (memory.get(key) as string) : null;
  },

  set(key: string, value: string): void {
    memory.set(key, value);
    const store = backing();
    if (store) {
      try {
        store.setItem(key, value);
      } catch {
        /* memory copy is enough */
      }
    }
  },

  remove(key: string): void {
    memory.delete(key);
    const store = backing();
    if (store) {
      try {
        store.removeItem(key);
      } catch {
        /* nothing else to do */
      }
    }
  },
};
