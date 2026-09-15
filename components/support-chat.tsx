"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, X } from "lucide-react";
import type { ProductView } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND, STATUS_META, taka, waLink } from "@/lib/brand";
import { imgSrc, searchProducts, useProducts } from "@/lib/use-store";
import { apiRequest } from "@/lib/query-client";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  products?: ProductView[];
  links?: { label: string; href: string; external?: boolean }[];
};

const QUICK_REPLIES = [
  "Payment Info",
  "Track My Order",
  "Delivery",
  "Contact Us",
  "Talk on WhatsApp",
] as const;

let messageId = 0;
const nextId = () => ++messageId;

const GREETING: Message = {
  id: nextId(),
  from: "bot",
  text: "Assalamu alaikum, welcome to Insaf Mart. Ask about payment, delivery or any product — or type a product name and I'll find it for you.",
};

/** Keyword-matched answers for the questions we get most often. */
function answerFor(input: string): Message | null {
  const q = input.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("payment", "bkash", "nagad", "pay", "send money", "টাকা")) {
    return {
      id: nextId(),
      from: "bot",
      text:
        `You can pay two ways.\n\n` +
        `1. Cash on Delivery — pay the rider when the parcel arrives.\n` +
        `2. Advance payment — Send Money to bKash ${BRAND.bkash} (Personal) or Nagad ${BRAND.nagad}, ` +
        `then enter the Transaction ID at checkout. We verify it against our account and confirm your order, usually within a few hours.`,
      links: [{ label: "Go to checkout", href: "/checkout" }],
    };
  }

  if (has("track", "order status", "where is my order", "my order")) {
    return {
      id: nextId(),
      from: "bot",
      text: "Sure — send me your order number and I'll check. It looks like IM-260911-4821.",
    };
  }

  if (has("delivery", "shipping", "courier", "how long", "when will")) {
    return {
      id: nextId(),
      from: "bot",
      text:
        `Delivery is ৳${BRAND.shipping.insideDhaka} inside Dhaka and ৳${BRAND.shipping.outsideDhaka} outside Dhaka, ` +
        `and free on orders over ৳${BRAND.shipping.freeAbove.toLocaleString("en-BD")}.\n\n` +
        `Inside Dhaka usually arrives in 24–48 hours; outside Dhaka takes 2–4 days.`,
    };
  }

  if (has("contact", "phone", "email", "call", "number", "address", "help")) {
    return {
      id: nextId(),
      from: "bot",
      text: `Email us at ${BRAND.email}, or message ${BRAND.whatsapp[0].number} / ${BRAND.whatsapp[1].number} on WhatsApp. We reply from 10am to 10pm, seven days a week.`,
      links: [
        { label: "Contact page", href: "/contact" },
        { label: "WhatsApp us", href: waLink(BRAND.whatsapp[0].number), external: true },
      ],
    };
  }

  if (has("whatsapp")) {
    return {
      id: nextId(),
      from: "bot",
      text: `Here are both WhatsApp numbers — ${BRAND.whatsapp[0].number} for orders and ${BRAND.whatsapp[1].number} for support.`,
      links: [
        { label: `WhatsApp ${BRAND.whatsapp[0].number}`, href: waLink(BRAND.whatsapp[0].number), external: true },
        { label: `WhatsApp ${BRAND.whatsapp[1].number}`, href: waLink(BRAND.whatsapp[1].number), external: true },
      ],
    };
  }

  if (has("return", "refund", "exchange", "damaged", "broken")) {
    return {
      id: nextId(),
      from: "bot",
      text: "If something arrives damaged or wrong, message us within 48 hours with a photo and we'll replace it or refund you. Sealed attar and skincare can't be returned once opened, for hygiene reasons.",
    };
  }

  if (has("gift", "combo", "box", "eid", "valentine", "anniversary")) {
    return {
      id: nextId(),
      from: "bot",
      text: "Our gift boxes are the Royal Attar Box, the Couple Box and the Daily Glow Combo, plus ready-made Eid, Valentine, anniversary and self-care boxes — and a build-your-own option.",
      links: [{ label: "See all gift boxes", href: "/shop?category=gifts" }],
    };
  }

  if (has("hello", "hi", "salam", "assalam", "hey")) {
    return {
      id: nextId(),
      from: "bot",
      text: "Wa alaikum assalam. How can I help — payment, delivery, or finding a product?",
    };
  }

  return null;
}

const ORDER_PATTERN = /\b(IM-\d{6}-\d{3,5})\b/i;

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: products = [] } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const push = (m: Message) => setMessages((current) => [...current, m]);

  async function handle(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;

    push({ id: nextId(), from: "user", text });
    setDraft("");
    setBusy(true);

    // Give the reply a beat so it reads as a conversation rather than a lookup.
    await new Promise((r) => setTimeout(r, 260));

    const orderMatch = text.match(ORDER_PATTERN);
    if (orderMatch) {
      try {
        const res = await apiRequest("GET", `/api/orders/track/${orderMatch[1].toUpperCase()}`);
        const order = await res.json();
        const status = STATUS_META[order.status]?.label ?? order.status;
        push({
          id: nextId(),
          from: "bot",
          text: `Order ${order.orderNumber} — ${status}. ${order.itemCount} item${
            order.itemCount === 1 ? "" : "s"
          }, ${taka(order.total)} total, placed ${new Date(order.createdAt).toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short" },
          )}.`,
          links: [{ label: "See full details in My Account", href: "/account" }],
        });
      } catch (err) {
        push({
          id: nextId(),
          from: "bot",
          text:
            (err as Error).message ||
            "I couldn't find that order number. Double-check it, or WhatsApp us and we'll look it up.",
        });
      }
      setBusy(false);
      return;
    }

    const faq = answerFor(text);
    if (faq) {
      push(faq);
      setBusy(false);
      return;
    }

    const matches = searchProducts(products, text).slice(0, 3);
    if (matches.length > 0) {
      push({
        id: nextId(),
        from: "bot",
        text:
          matches.length === 1
            ? "Found this one for you:"
            : `Found ${matches.length} matches for “${text}”:`,
        products: matches,
      });
    } else {
      push({
        id: nextId(),
        from: "bot",
        text: `I'm not sure about that one. Try “payment”, “delivery”, an order number, or a product name like “oud attar” or “lip tint”. You can also message us on WhatsApp ${BRAND.whatsapp[0].number}.`,
        links: [{ label: "Talk on WhatsApp", href: waLink(BRAND.whatsapp[0].number), external: true }],
      });
    }
    setBusy(false);
  }

  const panelId = "insaf-support-chat";

  return (
    <>
      {open && (
        <div
          id={panelId}
          className="fixed bottom-4 right-4 z-50 flex h-[min(30rem,calc(100dvh-2rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-border bg-background shadow-2xl sm:bottom-6 sm:right-6"
          data-testid="panel-support-chat"
        >
          <div className="flex items-center justify-between bg-foreground px-4 py-3 text-background">
            <div>
              <p className="font-serif text-base leading-none">Insaf Mart support</p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.65rem] text-background/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                Usually replies instantly
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="rounded-sm p-1 text-background/70 hover:text-background"
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-3 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-md px-3 py-2 text-[0.8rem] leading-relaxed",
                    m.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground",
                  )}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {m.products && m.products.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5">
                      {m.products.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/product/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-sm border border-border bg-card p-1.5 hover:border-primary"
                            data-testid={`link-chat-product-${p.slug}`}
                          >
                            <img src={imgSrc(p.images[0])} alt="" className="h-10 w-10 rounded-sm object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.78rem] text-foreground">
                                {p.title}
                              </span>
                              <span className="block font-serif text-sm text-primary">
                                {taka(p.price)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {m.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) =>
                        l.external ? (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-sm border border-border px-2 py-1 text-[0.7rem] text-foreground hover:border-primary hover:text-primary"
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link
                            key={l.label}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="rounded-sm border border-border px-2 py-1 text-[0.7rem] text-foreground hover:border-primary hover:text-primary"
                          >
                            {l.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-md border border-border bg-background px-3 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background">
            <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    q === "Talk on WhatsApp"
                      ? window.open(waLink(BRAND.whatsapp[0].number), "_blank", "noreferrer")
                      : handle(q)
                  }
                  className="press shrink-0 rounded-full border border-border px-3 py-1.5 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-primary"
                  data-testid={`button-quick-${q.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-2 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                handle(draft);
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="h-9 rounded-sm text-sm"
                aria-label="Message"
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                className="press h-9 w-9 shrink-0 rounded-sm"
                aria-label="Send message"
                disabled={!draft.trim() || busy}
                data-testid="button-send-chat"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open support chat"
          aria-expanded={open}
          data-testid="button-open-chat"
          className="press fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
