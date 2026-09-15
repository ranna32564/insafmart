"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND, waLink } from "@/lib/brand";

const FAQS = [
  {
    q: "How do I pay with bKash or Nagad?",
    a: `At checkout choose "Non-Cash on Delivery", pick bKash or Nagad, then Send Money to bKash ${BRAND.bkash} or Nagad ${BRAND.nagad}. Paste the transaction ID into the form and place the order. We verify it manually and email your invoice once it clears.`,
  },
  {
    q: "Is cash on delivery available everywhere?",
    a: "Yes — all 64 districts. Delivery is ৳120 inside Dhaka and ৳140 outside, and free on orders over ৳3,000. You pay the rider when the parcel arrives.",
  },
  {
    q: "How long does delivery take?",
    a: "Inside Dhaka usually 24–48 hours. Outside Dhaka 2–4 days by courier. We message you on WhatsApp when the parcel is handed over.",
  },
  {
    q: "Are your attars alcohol-free?",
    a: "Our ladies roll-on perfume oils are alcohol-free, and several gents attars are too. It's stated clearly on each product page.",
  },
  {
    q: "Can you gift-wrap and hide the price?",
    a: "Yes. Add a note at checkout and we will wrap it and leave the invoice out of the parcel.",
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const waMessage = `Hello Insaf Mart, I'd like to enquire about a product.${form.name ? ` I'm ${form.name}.` : ""}${
    form.message ? ` ${form.message}` : ""
  }`;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a real person"
        description="WhatsApp is fastest — we usually reply within an hour between 10am and 10pm."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Channels */}
          <div className="lg:col-span-5">
            <Reveal className="space-y-4">
              {BRAND.whatsapp.map((w) => (
                <a
                  key={w.number}
                  href={waLink(w.number, "Hello Insaf Mart, I'd like to enquire about a product.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift flex items-start gap-4 rounded-md border border-border bg-card p-5"
                  data-testid={`link-whatsapp-${w.number}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#25D366]/10">
                    <MessageCircle className="h-4 w-4 text-[#128C7E]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      WhatsApp · {w.number}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{w.label}</span>
                  </span>
                </a>
              ))}

              <a
                href={`mailto:${BRAND.email}`}
                className="card-lift flex items-start gap-4 rounded-md border border-border bg-card p-5"
                data-testid="link-email"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{BRAND.email}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Orders, invoices and wholesale
                  </span>
                </span>
              </a>

              <a
                href={`tel:+88${BRAND.whatsapp[0].number}`}
                className="card-lift flex items-start gap-4 rounded-md border border-border bg-card p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    +88 {BRAND.whatsapp[0].number}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Call for urgent order changes
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-6 rounded-md border border-border bg-card p-6">
                <p className="eyebrow text-primary">Payment numbers</p>
                <div className="mt-4 space-y-3">
                  {[
                    { name: "bKash (Send Money)", number: BRAND.bkash, tint: "#E2136E" },
                    { name: "Nagad (Send Money)", number: BRAND.nagad, tint: "#F6821F" },
                  ].map((p) => (
                    <div key={p.number} className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-sm text-xs font-bold text-white"
                        style={{ backgroundColor: p.tint }}
                        aria-hidden
                      >
                        {p.name[0]}
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                        <p className="font-serif text-lg tabular-nums text-foreground">
                          {p.number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rule-gold my-5" />

                <div className="space-y-3 text-xs text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Open daily 10:00 – 22:00 (Bangladesh time)
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Online only — we ship from Dhaka to all 64 districts
                  </p>
                  <p className="flex items-start gap-2">
                    <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Order tracking is in My Account, or ask in the chat widget
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Message form + FAQ */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="rounded-md border border-border bg-card p-6 sm:p-7">
                <h2 className="font-serif text-2xl text-foreground">Send us a message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Write it here and we will open WhatsApp with your message ready to send — or
                  email us directly.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ct-name">Your name</Label>
                    <Input
                      id="ct-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1.5 h-11 rounded-sm"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ct-email">Email (optional)</Label>
                    <Input
                      id="ct-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5 h-11 rounded-sm"
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="ct-message">Message</Label>
                    <Textarea
                      id="ct-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ask about a product, an order, or wholesale pricing…"
                      className="mt-1.5 resize-none rounded-sm"
                      data-testid="input-contact-message"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="press rounded-sm"
                    onClick={() => setSent(true)}
                    data-testid="button-send-whatsapp"
                  >
                    <a
                      href={waLink(BRAND.whatsapp[0].number, waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send on WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="press rounded-sm">
                    <a
                      href={`mailto:${BRAND.email}?subject=${encodeURIComponent(
                        `Enquiry from ${form.name || "a customer"}`,
                      )}&body=${encodeURIComponent(form.message)}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send by email
                    </a>
                  </Button>
                </div>

                {sent && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    WhatsApp should have opened in a new tab with your message. If it did not,
                    message {BRAND.whatsapp[0].number} directly.
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8">
                <p className="eyebrow text-primary">Before you ask</p>
                <h2 className="mt-3 font-serif text-2xl text-foreground">Common questions</h2>
                <Accordion type="single" collapsible className="mt-4">
                  {FAQS.map((f, i) => (
                    <AccordionItem key={f.q} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
