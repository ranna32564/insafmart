"use client";

import Link from "next/link";
import { Leaf, PackageCheck, Sparkles, Truck } from "lucide-react";
import { PageHeader } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const VALUES = [
  {
    icon: Sparkles,
    title: "Genuine, never refilled",
    body: "Our attars come from long-standing Dhaka and Middle Eastern suppliers, and skincare is sourced sealed with intact batch codes. Nothing is decanted or topped up.",
  },
  {
    icon: PackageCheck,
    title: "Packed like a gift",
    body: "Every parcel is wrapped by hand in tissue with a sealed outer box. If you are sending it straight to someone else, tell us in the order note and we will leave out the invoice.",
  },
  {
    icon: Truck,
    title: "Honest delivery",
    body: "৳120 inside Dhaka, ৳140 elsewhere, free over ৳3,000. We message you on WhatsApp when the courier collects, not three days later.",
  },
  {
    icon: Leaf,
    title: "Alcohol-free options",
    body: "Our ladies roll-on oils and several gents attars are alcohol-free, which matters to many of our customers. It's marked clearly on every product page.",
  },
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A small shop with a long memory for scent"
        description="Insaf Mart began as a table of attar bottles and grew into a curated store for fragrance, skincare, hair accessories and gifts — run from Dhaka, shipped across Bangladesh."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="space-y-5 text-[0.95rem] leading-[1.8] text-muted-foreground">
                <p>
                  We started with one category we genuinely understood: attar. Oud, musk, amber —
                  the oils people buy for Jummah, for Eid, for a wedding. Selling those well meant
                  learning which suppliers keep their quality steady, which bottles leak in
                  courier bags, and how to describe a scent honestly so nobody is disappointed
                  when the parcel opens.
                </p>
                <p>
                  That standard is the reason the rest of the shop exists. Customers who trusted
                  us for attar started asking about sunscreen, lip tints, silk scrunchies,
                  anti-tarnish rings, and gift boxes for birthdays. So we added them — one
                  category at a time, only stocking things we would give to our own families.
                </p>
                <p>
                  Today Insaf Mart carries five collections and around fifty products. It is
                  deliberately small. A short list we can vouch for beats a catalogue of thousands
                  we have never opened.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {VALUES.map((v) => (
                  <div key={v.title} className="rounded-md border border-border bg-card p-5">
                    <v.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-3.5 text-sm font-medium text-foreground">{v.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{v.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <Reveal delay={60}>
              <div className="overflow-hidden rounded-md border border-border">
                <img
                  src="/images/hero-portrait.webp"
                  alt="Insaf Mart attar bottles and gift packaging"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-6 rounded-md border border-border bg-card p-6">
                <p className="eyebrow text-primary">By the numbers</p>
                <dl className="mt-5 space-y-4">
                  {[
                    ["Products in stock", "52"],
                    ["Collections", "5"],
                    ["Districts delivered to", "64"],
                    ["Dhaka delivery", "24–48 hrs"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-serif text-xl text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="rule-gold my-6" />

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Questions before you order? WhatsApp {BRAND.whatsapp[0].number} or email{" "}
                  {BRAND.email}. We answer every message ourselves.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/shop">
                    <Button className="press rounded-sm">Browse the shop</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="press rounded-sm">
                      Contact us
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  );
}
