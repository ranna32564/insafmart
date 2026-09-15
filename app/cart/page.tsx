"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { imgSrc } from "@/lib/use-store";
import { BRAND, taka } from "@/lib/brand";

export default function CartPage() {
  const { lines, subtotal, count, setQuantity, remove } = useCart();
  const toFree = Math.max(0, BRAND.shipping.freeAbove - subtotal);
  const estimatedShipping = subtotal >= BRAND.shipping.freeAbove ? 0 : BRAND.shipping.insideDhaka;

  if (lines.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Your bag" title="Your bag is empty" />
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing added yet. The Royal Attar Box and the Daily Glow Combo are the two most
            common places to start.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop">
              <Button className="press rounded-sm" data-testid="button-empty-shop">
                Browse the shop
              </Button>
            </Link>
            <Link href="/shop?category=gifts">
              <Button variant="outline" className="press rounded-sm">
                See gift boxes
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Your bag"
        title={`${count} item${count === 1 ? "" : "s"} in your bag`}
        description="Review the quantities, then continue to delivery and payment."
      />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li
                key={`${line.productId}-${line.variant ?? ""}`}
                className="flex gap-4 py-5"
                data-testid={`row-cartpage-${line.slug}`}
              >
                <Link href={`/product/${line.slug}`} className="shrink-0">
                  <img
                    src={imgSrc(line.image ?? "/images/hero-main.webp")}
                    alt={line.title}
                    className="h-28 w-28 rounded-sm border border-border object-cover sm:h-32 sm:w-32"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.slug}`}
                        className="text-sm font-medium leading-snug text-foreground hover:text-primary sm:text-base"
                      >
                        {line.title}
                      </Link>
                      {line.variant && (
                        <p className="mt-1 text-xs text-muted-foreground">{line.variant}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {taka(line.price)} each
                      </p>
                    </div>
                    <span className="shrink-0 font-serif text-lg text-foreground sm:text-xl">
                      {taka(line.price * line.quantity)}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-4 pt-4">
                    <div className="flex items-center rounded-sm border border-border">
                      <button
                        onClick={() => setQuantity(line.productId, line.variant, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-8 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(line.productId, line.variant, line.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={line.quantity >= line.stock}
                        className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(line.productId, line.variant)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      data-testid={`button-remove-page-${line.slug}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            Continue shopping
          </Link>
        </div>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-xl text-foreground">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-foreground" data-testid="text-page-subtotal">
                  {taka(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery (estimated)</dt>
                <dd className="text-foreground">
                  {estimatedShipping === 0 ? "Free" : taka(estimatedShipping)}
                </dd>
              </div>
            </dl>

            {toFree > 0 && (
              <p className="mt-4 rounded-sm bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                Add <strong className="text-foreground">{taka(toFree)}</strong> more and delivery
                is on us.
              </p>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="text-sm text-muted-foreground">Estimated total</span>
              <span className="font-serif text-2xl text-primary">
                {taka(subtotal + estimatedShipping)}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Final delivery charge depends on your district and is confirmed at checkout.
            </p>

            <Link href="/checkout">
              <Button className="press mt-5 h-12 w-full rounded-sm" data-testid="button-to-checkout">
                Continue to checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
              Cash on delivery · bKash {BRAND.bkash} · Nagad {BRAND.nagad}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
