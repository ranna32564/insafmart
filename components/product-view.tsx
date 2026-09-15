"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { imgSrc, useProduct, useProducts } from "@/lib/use-store";
import { BRAND, CATEGORY_META, categoryLabel, taka } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { variantSurcharge } from "@/lib/schema";

export function ProductView({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: all = [] } = useProducts();
  const { add, openCart } = useCart();

  const [variant, setVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setVariant(product?.variants[0] ?? null);
    setQuantity(1);
    setFrame(0);
  }, [product?.id, product?.variants]);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const context = CATEGORY_META.find((c) => c.slug === product.category)?.image;
    return (context ? [...product.images, context] : product.images).map((src) => imgSrc(src));
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return all
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [all, product]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-md bg-muted" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
            <div className="h-12 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
        <h1 className="font-serif text-2xl text-foreground">We can't find that product</h1>
        <p className="text-sm text-muted-foreground">
          It may have sold out and been removed. Everything currently in stock is on the shop
          page.
        </p>
        <Link href="/shop">
          <Button className="press rounded-sm">Back to the shop</Button>
        </Link>
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  // A variant surcharge lifts the live price, so the strike-through only makes
  // sense while the compare-at price is still above it.
  const livePrice = product.price + variantSurcharge(variant);
  const discount =
    product.comparePrice && product.comparePrice > livePrice
      ? Math.round(((product.comparePrice - livePrice) / product.comparePrice) * 100)
      : 0;

  const addToBag = () => {
    add(product, quantity, variant);
  };

  const buyNow = () => {
    add(product, quantity, variant);
    router.push("/checkout");
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex w-full max-w-7xl items-center gap-1.5 px-4 py-5 text-xs text-muted-foreground sm:px-6"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-primary">
          {categoryLabel(product.category)}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={gallery[frame]}
                alt={product.title}
                className="aspect-square w-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setFrame(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={frame === i}
                    className={cn(
                      "h-20 w-20 overflow-hidden rounded-sm border transition-colors",
                      frame === i ? "border-primary" : "border-border hover:border-primary/40",
                    )}
                    data-testid={`button-thumb-${i}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div>
            {product.collection && (
              <p className="eyebrow text-primary">{product.collection}</p>
            )}
            <h1
              className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl"
              data-testid="text-product-title"
            >
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span
                className="font-serif text-3xl text-primary"
                data-testid="text-product-price"
              >
                {taka(livePrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {taka(product.comparePrice!)}
                  </span>
                  <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-primary">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {soldOut ? (
                <span className="text-destructive">Out of stock — check back soon</span>
              ) : product.stock <= 8 ? (
                <span className="text-gold">Only {product.stock} left in stock</span>
              ) : (
                <>In stock · ready to ship from Dhaka</>
              )}
            </p>

            <div className="rule-gold my-7" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-7">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {product.variants[0].match(/ml|Flavour|Pair/i) ? "Size" : "Option"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={cn(
                        "press rounded-sm border px-4 py-2 text-sm transition-colors",
                        variant === v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/50",
                      )}
                      data-testid={`button-variant-${v.replace(/\s/g, "-").toLowerCase()}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-stretch gap-3">
              <div className="flex items-center rounded-sm border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-3 text-muted-foreground hover:text-foreground"
                  data-testid="button-qty-minus"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-9 text-center text-sm tabular-nums" data-testid="text-qty">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock}
                  className="px-3.5 py-3 text-muted-foreground hover:text-foreground disabled:opacity-40"
                  data-testid="button-qty-plus"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                className="press h-12 flex-1 rounded-sm sm:flex-none sm:px-8"
                disabled={soldOut}
                onClick={addToBag}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to bag
              </Button>

              <Button
                variant="outline"
                className="press h-12 w-full rounded-sm sm:w-auto sm:px-8"
                disabled={soldOut}
                onClick={buyNow}
                data-testid="button-buy-now"
              >
                Buy now
              </Button>
            </div>

            <button
              onClick={openCart}
              className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              View bag
            </button>

            <div className="mt-8 grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-3">
              {[
                { icon: Truck, title: "Fast delivery", body: "৳120 Dhaka · ৳140 outside" },
                { icon: ShieldCheck, title: "Genuine stock", body: "Sealed, never refilled" },
                { icon: RotateCcw, title: "48h replacement", body: "If it arrives damaged" },
              ].map((f) => (
                <div key={f.title} className="flex gap-2.5">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="delivery">
                <AccordionTrigger className="text-sm">Delivery &amp; charges</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Inside Dhaka ৳{BRAND.shipping.insideDhaka}, arriving in 24–48 hours. Outside
                  Dhaka ৳{BRAND.shipping.outsideDhaka}, 2–4 days by courier. Delivery is free on
                  orders over ৳{BRAND.shipping.freeAbove.toLocaleString("en-BD")}. We message
                  you on WhatsApp when the parcel is handed over.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment">
                <AccordionTrigger className="text-sm">How to pay</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Choose Cash on Delivery and pay the rider, or pay in advance by Send Money to
                  bKash {BRAND.bkash} (Personal) or Nagad {BRAND.nagad}. For advance payment
                  you enter the transaction ID at checkout; we check it against our account and
                  email your invoice once it clears.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-sm">Returns</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Message us within 48 hours with a photo if anything arrives damaged, wrong or
                  missing and we will replace it or refund you. For hygiene reasons, opened
                  attar, skincare and lip products cannot be returned.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <p className="eyebrow text-primary">You might also like</p>
              <h2 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
                More from {categoryLabel(product.category)}
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
