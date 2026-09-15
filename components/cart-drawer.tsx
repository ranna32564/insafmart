"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { BRAND, taka } from "@/lib/brand";
import { imgSrc } from "@/lib/use-store";

export function CartDrawer() {
  const { lines, subtotal, count, isOpen, closeCart, setQuantity, remove } = useCart();
  const toFreeDelivery = Math.max(0, BRAND.shipping.freeAbove - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="space-y-1 border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-serif text-xl font-normal">Your bag</SheetTitle>
          <SheetDescription className="text-xs">
            {count === 0 ? "Nothing here yet" : `${count} item${count === 1 ? "" : "s"}`}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your bag is empty. Start with a gift box or a signature attar.
            </p>
            <Link href="/shop">
              <Button className="press rounded-sm" onClick={closeCart} data-testid="button-cart-shop">
                Browse the shop
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {lines.map((line) => (
                <li
                  key={`${line.productId}-${line.variant ?? ""}`}
                  className="flex gap-3 py-4"
                  data-testid={`row-cart-${line.slug}`}
                >
                  <img
                    src={imgSrc(line.image ?? "/images/hero-main.webp")}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-sm border border-border object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="text-sm leading-snug text-foreground hover:text-primary"
                      >
                        {line.title}
                      </Link>
                      <button
                        onClick={() => remove(line.productId, line.variant)}
                        aria-label={`Remove ${line.title}`}
                        className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-destructive"
                        data-testid={`button-remove-${line.slug}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {line.variant && (
                      <span className="mt-0.5 text-xs text-muted-foreground">{line.variant}</span>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-sm border border-border">
                        <button
                          className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity(line.productId, line.variant, line.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          className="px-2 py-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                          aria-label="Increase quantity"
                          disabled={line.quantity >= line.stock}
                          onClick={() =>
                            setQuantity(line.productId, line.variant, line.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-serif text-base">
                        {taka(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-border bg-card px-5 py-4">
              {toFreeDelivery > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Spend <strong className="text-foreground">{taka(toFreeDelivery)}</strong> more
                  for free delivery.
                </p>
              ) : (
                <p className="text-xs text-gold">Free delivery unlocked.</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl" data-testid="text-cart-subtotal">
                  {taka(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery calculated at checkout · ৳120 inside Dhaka, ৳140 outside.
              </p>
              <Link href="/checkout" className="block">
                <Button
                  className="press h-11 w-full rounded-sm"
                  onClick={closeCart}
                  data-testid="button-checkout"
                >
                  Checkout
                </Button>
              </Link>
              <Link href="/cart" className="block">
                <Button
                  variant="outline"
                  className="press h-10 w-full rounded-sm"
                  onClick={closeCart}
                  data-testid="button-view-cart"
                >
                  View full bag
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
