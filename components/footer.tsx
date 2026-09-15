"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/use-toast";
import { BRAND, CATEGORY_META, waLink } from "@/lib/brand";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo stacked />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A small Bangladeshi boutique for long-lasting attar, honest skincare and
              gift boxes that feel considered. Packed by hand in Dhaka.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {BRAND.whatsapp.map((w) => (
                <a
                  key={w.number}
                  href={waLink(w.number, "Assalamu alaikum, I have a question about Insaf Mart.")}
                  target="_blank"
                  rel="noreferrer"
                  className="press inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-foreground hover:border-primary hover:text-primary"
                  data-testid={`link-whatsapp-${w.number}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {w.number}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="eyebrow text-foreground">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              {CATEGORY_META.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="eyebrow text-foreground">Help</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "About us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "My account", href: "/account" },
                { label: "Track an order", href: "/account" },
                { label: "Admin login", href: "/admin" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="eyebrow text-foreground">New arrivals, first</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One short email when a new attar or gift box lands. No spam, unsubscribe any
              time.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) {
                  toast({
                    title: "Check your email address",
                    description: "That does not look like a valid email.",
                    variant: "destructive",
                  });
                  return;
                }
                setEmail("");
                toast({
                  title: "You're on the list",
                  description: "We'll email you when something new arrives.",
                });
              }}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-10 rounded-sm"
                aria-label="Email address"
                data-testid="input-newsletter"
              />
              <Button type="submit" className="press h-10 rounded-sm px-5" data-testid="button-newsletter">
                Join
              </Button>
            </form>

            <div className="mt-7 space-y-2 text-sm text-muted-foreground">
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                {BRAND.email}
              </a>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                bKash {BRAND.bkash} · Nagad {BRAND.nagad}
              </p>
            </div>
          </div>
        </div>

        <div className="rule-gold mt-12" />

        <div className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Insaf Mart. All rights reserved.</p>
          <p>Dhaka, Bangladesh · Cash on delivery · bKash &amp; Nagad accepted</p>
        </div>
      </div>
    </footer>
  );
}
