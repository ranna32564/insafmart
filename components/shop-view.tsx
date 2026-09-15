"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/site-layout";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchProducts, useProducts } from "@/lib/use-store";
import { CATEGORY_META, taka } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
] as const;

const PRICE_BANDS = [
  { value: "all", label: "Any price", min: 0, max: Infinity },
  { value: "u499", label: "Under ৳499", min: 0, max: 499 },
  { value: "500-999", label: "৳500 – ৳999", min: 500, max: 999 },
  { value: "1000-1999", label: "৳1,000 – ৳1,999", min: 1000, max: 1999 },
  { value: "2000", label: "৳2,000 and above", min: 2000, max: Infinity },
] as const;

export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: products, isLoading } = useProducts();

  const category = params.get("category") ?? "all";
  const query = params.get("q") ?? "";

  const [term, setTerm] = useState(query);
  const [sort, setSort] = useState<string>("featured");
  const [band, setBand] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the box in step when the URL changes from the header search.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setTerm(query);
  }

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  };

  const results = useMemo(() => {
    let list = products ?? [];

    if (term.trim()) list = searchProducts(list, term);
    if (category !== "all") list = list.filter((p) => p.category === category);

    const priceBand = PRICE_BANDS.find((b) => b.value === band)!;
    list = list.filter((p) => p.price >= priceBand.min && p.price <= priceBand.max);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (!term.trim()) sorted.sort((a, b) => b.featured - a.featured || a.id - b.id);

    return sorted;
  }, [products, term, category, band, sort]);

  const activeCategory = CATEGORY_META.find((c) => c.slug === category);
  const hasFilters = category !== "all" || band !== "all" || Boolean(term.trim());

  return (
    <>
      <PageHeader
        eyebrow="The shop"
        title={activeCategory ? activeCategory.label : "Everything we stock"}
        description={
          activeCategory
            ? `${activeCategory.tagline}. Every item is genuine, sealed, and packed by hand in Dhaka.`
            : "Attar, skincare, hair accessories, jewellery and gift boxes — 52 products, all in stock and ready to ship."
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* Category pills */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          <button
            onClick={() => setParam("category", null)}
            className={cn(
              "press shrink-0 rounded-sm border px-4 py-2 text-[0.78rem] transition-colors",
              category === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            data-testid="filter-category-all"
          >
            All
          </button>
          {CATEGORY_META.map((c) => (
            <button
              key={c.slug}
              onClick={() => setParam("category", c.slug)}
              className={cn(
                "press shrink-0 rounded-sm border px-4 py-2 text-[0.78rem] transition-colors",
                category === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
              data-testid={`filter-category-${c.slug}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by name, scent or keyword…"
              className="h-10 rounded-sm pl-10"
              aria-label="Search products"
              data-testid="input-shop-search"
            />
            {term && (
              <button
                onClick={() => {
                  setTerm("");
                  setParam("q", null);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            className="press h-10 justify-between rounded-sm lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
            data-testid="button-toggle-filters"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Price &amp; sort
            </span>
          </Button>

          <div
            className={cn(
              "flex flex-col gap-3 sm:flex-row lg:flex",
              filtersOpen ? "flex" : "hidden lg:flex",
            )}
          >
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger
                className="h-10 w-full rounded-sm sm:w-48"
                aria-label="Filter by price"
                data-testid="select-price"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRICE_BANDS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                className="h-10 w-full rounded-sm sm:w-52"
                aria-label="Sort products"
                data-testid="select-sort"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" data-testid="text-result-count">
            {isLoading
              ? "Loading products…"
              : `${results.length} product${results.length === 1 ? "" : "s"}`}
            {results.length > 0 &&
              ` · from ${taka(Math.min(...results.map((p) => p.price)))}`}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setTerm("");
                setBand("all");
                setSort("featured");
                router.push("/shop");
              }}
              className="text-xs text-primary hover:underline"
              data-testid="button-clear-filters"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif text-xl text-foreground">Nothing matched that</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try a broader search — “oud”, “lip”, “scrunchie” or “gift” all return plenty.
              </p>
            </div>
            <Button
              variant="outline"
              className="press rounded-sm"
              onClick={() => {
                setTerm("");
                setBand("all");
                router.push("/shop");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div
            className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="grid-products"
          >
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
