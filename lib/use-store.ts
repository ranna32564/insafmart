"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { ProductView } from "@/lib/schema";

export function useProducts() {
  return useQuery<ProductView[]>({ queryKey: ["/api/products"] });
}

export function useProduct(slug: string | undefined) {
  return useQuery<ProductView>({
    queryKey: ["/api/products", slug],
    enabled: Boolean(slug),
  });
}

export type StoreConfig = {
  brand: {
    name: string;
    email: string;
    whatsapp: string[];
    bkash: string;
    nagad: string;
    shipping: { insideDhaka: number; outsideDhaka: number; freeAbove: number };
  };
  mailEnabled: boolean;
  adminEmail: string;
};

export function useStoreConfig() {
  return useQuery<StoreConfig>({ queryKey: ["/api/config"] });
}

/**
 * Adds `is-visible` once the element scrolls into view, driving the
 * fade-and-rise defined in index.css. Falls back to visible immediately when
 * IntersectionObserver is unavailable.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/** Debounce any fast-changing value (search boxes, filters). */
export function useDebounced<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Case-insensitive match across title, description, category and tags. */
export function searchProducts(products: ProductView[], term: string): ProductView[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  return products
    .map((p) => {
      const haystack = [p.title, p.category, p.collection ?? "", p.description, ...p.tags]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const w of words) {
        if (p.title.toLowerCase().includes(w)) score += 4;
        else if (p.tags.some((t) => t.toLowerCase().includes(w))) score += 3;
        else if (haystack.includes(w)) score += 1;
      }
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

/* -------------------------------------------------------------------------- */
/* Assets                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The reference app served images from relative paths (`./images/x.webp`).
 * Next.js serves `public/` from the root, so normalise every product image to
 * `/images/x.webp` in the one place that renders them.
 */
export function imgSrc(src?: string | null): string {
  const raw = (src ?? "").trim();
  if (!raw) return "/images/hero-main.webp";
  if (/^(?:[a-z]+:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return "/" + raw.replace(/^\.?\/*/, "");
}
