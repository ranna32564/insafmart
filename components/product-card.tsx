"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { ProductView } from "@/lib/schema";
import { taka } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { imgSrc } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: ProductView;
  className?: string;
}) {
  const { add } = useCart();
  const soldOut = product.stock <= 0;
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return (
    <article
      className={cn(
        "card-lift group relative flex flex-col overflow-hidden rounded-md border border-border bg-card",
        className,
      )}
      data-testid={`card-product-${product.slug}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={imgSrc(product.images[0] ?? "/images/hero-main.webp")}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {discount > 0 && !soldOut && (
          <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
            −{discount}%
          </span>
        )}
        {product.isCombo === 1 && (
          <span className="absolute right-3 top-3 rounded-sm border border-gold/50 bg-background/90 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-gold">
            Gift box
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <span className="rounded-sm border border-border bg-background px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sold out
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link href={`/product/${product.slug}`} className="min-w-0">
          <h3
            className="text-sm font-medium leading-snug text-foreground hover:text-primary"
            data-testid={`text-product-title-${product.slug}`}
          >
            {product.title}
          </h3>
        </Link>

        <p className="hidden line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:block">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span
              className="font-serif text-base leading-none text-foreground sm:text-lg"
              data-testid={`text-product-price-${product.slug}`}
            >
              {taka(product.price)}
            </span>
            {discount > 0 && (
              <span className="mt-1 text-xs text-muted-foreground line-through">
                {taka(product.comparePrice!)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            aria-label={`Add ${product.title} to bag`}
            disabled={soldOut}
            className="press h-8 w-8 shrink-0 sm:h-9 sm:w-9 rounded-sm border-border hover:border-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => add(product, 1, product.variants[0] ?? null)}
            data-testid={`button-add-${product.slug}`}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>

        {!soldOut && product.stock <= 8 && (
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-gold">
            Only {product.stock} left
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
