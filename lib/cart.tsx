"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { variantSurcharge, type ProductView } from "@/lib/schema";
import { BRAND } from "./brand";
import { safeStorage } from "./safe-storage";

export type CartLine = {
  productId: number;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  variant: string | null;
  image: string | null;
  stock: number;
};

const STORAGE_KEY = "insaf_mart_cart";

/** Storage is blocked in sandboxed preview iframes — never let it throw. */
function readStored(): CartLine[] {
  try {
    const raw = safeStorage.get(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeStored(lines: CartLine[]) {
  safeStorage.set(STORAGE_KEY, JSON.stringify(lines));
}

const lineKey = (productId: number, variant: string | null) =>
  `${productId}::${variant ?? ""}`;

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shippingFor: (city: string) => number;
  add: (product: ProductView, quantity?: number, variant?: string | null) => void;
  setQuantity: (productId: number, variant: string | null, quantity: number) => void;
  remove: (productId: number, variant: string | null) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStored());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    writeStored(lines);
  }, [lines]);

  const add = useCallback(
    (product: ProductView, quantity = 1, variant: string | null = null) => {
      setLines((current) => {
        const key = lineKey(product.id, variant);
        const existing = current.find((l) => lineKey(l.productId, l.variant) === key);
        if (existing) {
          return current.map((l) =>
            lineKey(l.productId, l.variant) === key
              ? { ...l, quantity: Math.min(l.quantity + quantity, product.stock || 99) }
              : l,
          );
        }
        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            title: product.title,
            price: product.price + variantSurcharge(variant),
            quantity: Math.min(quantity, product.stock || 99),
            variant,
            image: product.images[0] ?? null,
            stock: product.stock,
          },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: number, variant: string | null, quantity: number) => {
      setLines((current) =>
        quantity <= 0
          ? current.filter((l) => lineKey(l.productId, l.variant) !== lineKey(productId, variant))
          : current.map((l) =>
              lineKey(l.productId, l.variant) === lineKey(productId, variant)
                ? { ...l, quantity: Math.min(quantity, l.stock || 99) }
                : l,
            ),
      );
    },
    [],
  );

  const remove = useCallback((productId: number, variant: string | null) => {
    setLines((current) =>
      current.filter((l) => lineKey(l.productId, l.variant) !== lineKey(productId, variant)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      shippingFor: (city: string) => {
        if (subtotal === 0) return 0;
        if (subtotal >= BRAND.shipping.freeAbove) return 0;
        return /dhaka|ঢাকা/i.test(city || "")
          ? BRAND.shipping.insideDhaka
          : BRAND.shipping.outsideDhaka;
      },
      add,
      setQuantity,
      remove,
      clear,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [lines, isOpen, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
