"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { imgSrc, useDebounced, useProducts, searchProducts } from "@/lib/use-store";
import { CATEGORY_META, taka } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Gift Boxes", href: "/shop?category=gifts" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term);
  const { data: products = [] } = useProducts();
  const router = useRouter();

  const results = useMemo(
    () => searchProducts(products, debounced).slice(0, 6),
    [products, debounced],
  );

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (term.trim()) go(`/shop?q=${encodeURIComponent(term.trim())}`);
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search attar, serum, gift box…"
            className="h-11 rounded-sm pl-10 pr-10"
            data-testid="input-search"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        {debounced.trim() && (
          <div className="mt-4">
            {results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing matched “{debounced}”. Try “oud”, “lip tint” or “gift”.
              </p>
            ) : (
              <ul className="divide-y divide-border" data-testid="list-search-results">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => go(`/product/${p.slug}`)}
                      className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-muted/60"
                    >
                      <img
                        src={imgSrc(p.images[0])}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-sm object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">
                          {p.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {CATEGORY_META.find((c) => c.slug === p.category)?.label}
                        </span>
                      </span>
                      <span className="shrink-0 font-serif text-base">{taka(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const location = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const { count, openCart } = useCart();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Read the query string on the client without useSearchParams().
  // This keeps the header compatible with the current Next.js setup
  // and prevents Shop + Gift Boxes from being active together.
  useEffect(() => {
    setCurrentSearch(window.location.search);
  });

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefPath !== location) return false;

    if (!hrefQuery) {
      // /shop remains active for normal shop/search pages,
      // but not for /shop?category=gifts.
      return !(
        hrefPath === "/shop" &&
        new URLSearchParams(currentSearch).get("category") === "gifts"
      );
    }

    const hrefParams = new URLSearchParams(hrefQuery);
    const currentParams = new URLSearchParams(currentSearch);

    for (const [key, value] of hrefParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }

    return true;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_0_0_hsl(var(--border))]",
      )}
    >
      <div className="bg-foreground text-background">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.18em] sm:px-6">
          Free delivery over ৳3,000 · Cash on delivery across Bangladesh
        </p>
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-9 w-9 md:hidden"
              aria-label="Open menu"
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-xs p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="border-b border-border p-5">
              <Link href="/">
                <Logo stacked />
              </Link>
            </div>
            <nav className="flex flex-col p-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm px-3 py-3 text-sm text-foreground hover:bg-muted"
                  data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <p className="px-3 pb-1 pt-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                Categories
              </p>
              {CATEGORY_META.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="rounded-sm px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {c.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <Link
                href={user ? "/account" : "/signin"}
                className="rounded-sm px-3 py-3 text-sm text-foreground hover:bg-muted"
              >
                {user ? "My Account" : "Sign in"}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "relative py-1 text-[0.82rem] tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
                data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-0.5 left-0 h-px w-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            data-testid="button-search"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" />
          </Button>

          <Link href={user ? "/account" : "/signin"}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label={user ? "My account" : "Sign in"}
              data-testid="button-account"
            >
              <User className="h-[1.15rem] w-[1.15rem]" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
            onClick={openCart}
            data-testid="button-cart"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
            {count > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground"
                data-testid="text-cart-count"
              >
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
