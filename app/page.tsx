"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Gift, Sparkles, Truck } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { imgSrc, useProducts } from "@/lib/use-store";
import { CATEGORY_META, taka } from "@/lib/brand";
import { cn } from "@/lib/utils";

const PROMISES = [
  { icon: BadgeCheck, title: "Genuine, sealed stock", body: "Sourced direct. No refills, no dilution." },
  { icon: Truck, title: "Cash on delivery", body: "Pay the rider. Nationwide, 2–4 days." },
  { icon: Gift, title: "Gift-ready packing", body: "Every order boxed and ribboned by hand." },
  { icon: Sparkles, title: "Alcohol-free attar", body: "Perfume oils that last the whole day." },
];

const TESTIMONIALS = [
  {
    quote:
      "Ordered the Royal Attar Box for my father before Eid. The oud is the real thing — it lasted from Fajr right through to evening. The box itself looked far more expensive than what I paid.",
    name: "Tanvir H.",
    place: "Dhanmondi, Dhaka",
  },
  {
    quote:
      "I have sensitive skin and most sunscreens sting. This one didn't, and there was no white cast under my eyes. The Daily Glow Combo is now my standing monthly order.",
    name: "Nusrat J.",
    place: "Chattogram",
  },
  {
    quote:
      "Paid by bKash at 11pm and had the confirmation email before I woke up. Parcel came the next evening in Mirpur, wrapped properly. Genuinely good service.",
    name: "Sadia R.",
    place: "Mirpur, Dhaka",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-foreground">
      <div className="absolute inset-0">
        <img
          src="/images/hero-main.webp"
          alt=""
          className="hero-drift hidden h-full w-full object-cover opacity-[0.72] sm:block"
        />
        <img
          src="/images/hero-portrait.webp"
          alt=""
          className="h-full w-full object-cover opacity-[0.55] sm:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14120F]/95 via-[#14120F]/70 to-[#14120F]/10" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <p className="eyebrow text-[#D8B26A]">Dhaka · since 2023</p>
        <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.05] text-[#FBF9F5] sm:text-5xl lg:text-6xl">
          Attar that lasts the day.
          <br />
          Gifts that get remembered.
        </h1>
        <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-[#FBF9F5]/75">
          Alcohol-free oud and musk, Korean skincare that behaves in Dhaka humidity, and
          hand-packed gift boxes. Cash on delivery anywhere in Bangladesh, or pay ahead by
          bKash and Nagad.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/shop">
            <Button
              size="lg"
              className="press h-12 rounded-sm bg-[#FBF9F5] px-7 text-[#1C1A17] hover:bg-white"
              data-testid="button-hero-shop"
            >
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/shop?category=gifts">
            <Button
              size="lg"
              variant="outline"
              className="press h-12 rounded-sm border-[#FBF9F5]/60 bg-transparent px-7 text-[#FBF9F5] hover:bg-[#FBF9F5]/10 hover:text-[#FBF9F5]"
              data-testid="button-hero-gifts"
            >
              Gift boxes
            </Button>
          </Link>
        </div>

        <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-[#FBF9F5]/15 pt-7">
          {[
            { k: "52", v: "products in stock" },
            { k: "৳3,000", v: "free delivery over" },
            { k: "24–48h", v: "Dhaka delivery" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-serif text-2xl text-[#FBF9F5]">{s.k}</dt>
              <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[#FBF9F5]/55">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [tab, setTab] = useState<string>(CATEGORY_META[0].slug);

  const combos = useMemo(
    () => (products ?? []).filter((p) => p.isCombo === 1).slice(0, 3),
    [products],
  );
  const featured = useMemo(
    () => (products ?? []).filter((p) => p.featured === 1 && p.isCombo !== 1).slice(0, 8),
    [products],
  );
  const inTab = useMemo(
    () => (products ?? []).filter((p) => p.category === tab).slice(0, 4),
    [products, tab],
  );

  return (
    <>
      <Hero />

      {/* Promises */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="flex gap-3">
              <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[0.82rem] font-medium leading-tight text-foreground">
                  {p.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gift combos — the headline offer */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Signature gift boxes</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Three boxes we are known for
            </h2>
          </div>
          <Link
            href="/shop?category=gifts"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            All gift boxes
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((i) => <ProductCardSkeleton key={i} />)}

          {combos.map((combo, i) => (
            <Reveal key={combo.id} delay={i * 90}>
              <Link href={`/product/${combo.slug}`}>
                <article
                  className="card-lift group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card"
                  data-testid={`card-combo-${combo.slug}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={imgSrc(combo.images[0])}
                      alt={combo.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <span className="absolute left-4 top-4 rounded-sm bg-background/90 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-primary">
                      {combo.collection}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-xl text-foreground">{combo.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {combo.description}
                    </p>
                    <div className="mt-5 flex items-baseline gap-2.5 pt-1">
                      <span className="font-serif text-2xl text-primary">{taka(combo.price)}</span>
                      {combo.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {taka(combo.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Category tabs */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="eyebrow text-primary">Browse by category</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Five shelves, one shop
            </h2>
          </Reveal>

          <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist">
            {CATEGORY_META.map((c) => (
              <button
                key={c.slug}
                role="tab"
                aria-selected={tab === c.slug}
                onClick={() => setTab(c.slug)}
                className={cn(
                  "press shrink-0 rounded-sm border px-4 py-2.5 text-[0.8rem] transition-colors",
                  tab === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
                data-testid={`tab-${c.slug}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
              : inTab.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="mt-8">
            <Link href={`/shop?category=${tab}`}>
              <Button variant="outline" className="press rounded-sm" data-testid="button-tab-more">
                See all {CATEGORY_META.find((c) => c.slug === tab)?.label}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial band */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className="eyebrow text-primary">Why alcohol-free</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              A perfume oil behaves differently in this climate
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Spray perfumes rely on alcohol to carry the scent, and alcohol flashes off
                fast in Dhaka heat — which is why a body spray can vanish by noon. Attar is
                the oil itself, so it warms on the skin instead of evaporating off it.
              </p>
              <p>
                One dab behind the ear and on the inner wrist is enough. It stays close,
                develops through the day, and is safe to wear to the mosque. Our roll-ons for
                women work the same way, just lighter and floral rather than resinous.
              </p>
            </div>
            <div className="rule-gold my-7 max-w-xs" />
            <Link href="/shop?category=fragrance">
              <Button variant="outline" className="press rounded-sm" data-testid="button-editorial">
                Explore the fragrance shelf
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={100}>
            <div className="overflow-hidden rounded-md border border-border">
              <img
                src="/images/cat-fragrance.webp"
                alt="Attar bottles arranged on an ivory backdrop"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured grid */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">Best sellers</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                What people keep reordering
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
              data-testid="link-all-products"
            >
              All products
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ProductCardSkeleton key={i} />)
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="eyebrow text-primary">From our customers</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            Reviews we did not write ourselves
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-md border border-border bg-card p-6">
                <div aria-hidden className="mb-4 flex gap-0.5 text-gold">
                  {"★★★★★".split("").map((s, idx) => (
                    <span key={idx} className="text-sm">
                      {s}
                    </span>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm text-foreground">{t.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.place}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
