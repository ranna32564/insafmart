"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Check,
  Copy,
  Loader2,
  Lock,
  Smartphone,
} from "lucide-react";
import type { OrderView } from "@/lib/schema";
import { PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/use-toast";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";
import { imgSrc } from "@/lib/use-store";
import { BRAND, taka } from "@/lib/brand";
import { cn } from "@/lib/utils";

type PayMode = "cod" | "advance";
type Wallet = "bkash" | "nagad";

const DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Faridpur",
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-serif text-lg tabular-nums text-foreground">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
          } catch {
            /* clipboard blocked in the preview iframe — the number is visible anyway */
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="press shrink-0 rounded-sm border border-border px-2.5 py-2 text-muted-foreground hover:border-primary hover:text-primary"
        aria-label={`Copy ${label}`}
        data-testid={`button-copy-${label.toLowerCase().replace(/\s/g, "-")}`}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function Checkout() {
  const { lines, subtotal, shippingFor, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    area: "",
    notes: "",
  });
  const [payMode, setPayMode] = useState<PayMode>("cod");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<OrderView | null>(null);

  // Prefill from the signed-in account.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      customerName: f.customerName || user.name || "",
      email: f.email || user.email,
      phone: f.phone || user.phone || "",
      address: f.address || user.address || "",
    }));
  }, [user]);

  const shipping = shippingFor(form.city);
  const total = subtotal + shipping;
  const method = payMode === "cod" ? "cod" : wallet;

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (payMode === "advance" && !wallet) {
      toast({
        title: "Choose a wallet",
        description: "Select bKash or Nagad to continue.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/orders", {
        ...form,
        area: form.area || undefined,
        notes: form.notes || undefined,
        paymentMethod: method,
        transactionId: payMode === "advance" ? transactionId : undefined,
        senderNumber: payMode === "advance" ? senderNumber : undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          slug: l.slug,
          title: l.title,
          price: l.price,
          quantity: l.quantity,
          variant: l.variant,
        })),
      });
      const order = (await res.json()) as OrderView;
      clear();
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: "auto" });

      // Force refresh orders everywhere so admin + account pages update instantly
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/orders/mine"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      await queryClient.refetchQueries({ queryKey: ["/api/orders/mine"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/orders"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
    } catch (err) {
      toast({
        title: "We could not place the order",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------ Confirmation ----------------------------- */

  if (placed) {
    const awaiting = placed.status === "pending_verification";
    return (
      <>
        <PageHeader
          eyebrow="Order placed"
          title="Thank you — we have your order"
          description={`A confirmation has been emailed to ${placed.email}.`}
        />
        <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
          <div className="rounded-md border border-border bg-card p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Order number
                </p>
                <p
                  className="font-serif text-2xl text-foreground"
                  data-testid="text-order-number"
                >
                  {placed.orderNumber}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-6 rounded-sm border p-4 text-sm leading-relaxed",
                awaiting
                  ? "border-gold/40 bg-gold/5 text-foreground"
                  : "border-border bg-background text-foreground",
              )}
            >
              {awaiting ? (
                <>
                  <p className="font-medium">Pending payment verification</p>
                  <p className="mt-1.5 text-muted-foreground">
                    We are checking transaction ID{" "}
                    <strong className="text-foreground">{placed.transactionId}</strong> against
                    our {placed.paymentMethod === "bkash" ? "bKash" : "Nagad"} account. Once it
                    matches, your order is confirmed and the invoice is emailed to you and saved
                    in My Account. This usually takes a few hours.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Cash on delivery</p>
                  <p className="mt-1.5 text-muted-foreground">
                    Keep <strong className="text-foreground">{taka(placed.total)}</strong> ready
                    for the rider. We will confirm by WhatsApp before dispatch.
                  </p>
                </>
              )}
            </div>

            <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{taka(placed.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{placed.shipping === 0 ? "Free" : taka(placed.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base">
                <dt className="text-foreground">Total</dt>
                <dd className="font-serif text-xl text-primary">{taka(placed.total)}</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/account">
                <Button className="press rounded-sm" data-testid="button-view-account">
                  View in My Account
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="press rounded-sm">
                  Keep shopping
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Save your order number. You can paste it into the support chat at any time to see
              the current status, or message us on WhatsApp {BRAND.whatsapp[0].number}.
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ------------------------------- Empty bag ------------------------------- */

  if (lines.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="There is nothing to check out" />
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            Add something to your bag first and this page will be waiting.
          </p>
          <Link href="/shop">
            <Button className="press rounded-sm">Browse the shop</Button>
          </Link>
        </div>
      </>
    );
  }

  /* -------------------------------- Checkout ------------------------------- */

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        title="Delivery and payment"
        description="Cash on delivery anywhere in Bangladesh, or pay in advance with bKash or Nagad."
      />

      <form
        onSubmit={submit}
        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12"
      >
        <div className="space-y-10 lg:col-span-7 xl:col-span-8">
          {/* Contact + delivery */}
          <section>
            <h2 className="font-serif text-2xl text-foreground">1 · Where should it go?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  minLength={2}
                  value={form.customerName}
                  onChange={(e) => set("customerName")(e.target.value)}
                  placeholder="Khayrul Rahman"
                  className="mt-1.5 h-11 rounded-sm"
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  required
                  inputMode="tel"
                  minLength={11}
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="mt-1.5 h-11 rounded-sm"
                  data-testid="input-phone"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1.5 h-11 rounded-sm"
                  data-testid="input-email"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Your invoice and order updates are sent here.
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Full address</Label>
                <Textarea
                  id="address"
                  required
                  minLength={6}
                  rows={3}
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="House / road / flat, landmark"
                  className="mt-1.5 resize-none rounded-sm"
                  data-testid="input-address"
                />
              </div>
              <div>
                <Label htmlFor="city">District</Label>
                <select
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => set("city")(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="select-city"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="Other">Other district</option>
                </select>
              </div>
              <div>
                <Label htmlFor="area">Area / thana (optional)</Label>
                <Input
                  id="area"
                  value={form.area}
                  onChange={(e) => set("area")(e.target.value)}
                  placeholder="Dhanmondi"
                  className="mt-1.5 h-11 rounded-sm"
                  data-testid="input-area"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Order note (optional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder="Gift wrap, call before delivery, preferred time…"
                  className="mt-1.5 resize-none rounded-sm"
                  data-testid="input-notes"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-serif text-2xl text-foreground">2 · How would you like to pay?</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPayMode("cod");
                  setWallet(null);
                }}
                className={cn(
                  "press flex flex-col items-start gap-2 rounded-md border p-5 text-left transition-colors",
                  payMode === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
                data-testid="button-pay-cod"
              >
                <span className="flex items-center gap-2.5">
                  <Banknote
                    className={cn(
                      "h-5 w-5",
                      payMode === "cod" ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Pay the rider in cash when your parcel arrives. Nothing to pay now.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPayMode("advance")}
                className={cn(
                  "press flex flex-col items-start gap-2 rounded-md border p-5 text-left transition-colors",
                  payMode === "advance"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
                data-testid="button-pay-advance"
              >
                <span className="flex items-center gap-2.5">
                  <Smartphone
                    className={cn(
                      "h-5 w-5",
                      payMode === "advance" ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Non-Cash on Delivery
                  </span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Pay in advance by bKash or Nagad Send Money, then submit the transaction ID.
                </span>
              </button>
            </div>

            {payMode === "advance" && (
              <div className="mt-6 rounded-md border border-border bg-card p-5 sm:p-6">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Choose a wallet
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { key: "bkash", name: "bKash", number: BRAND.bkash, tint: "#E2136E" },
                      { key: "nagad", name: "Nagad", number: BRAND.nagad, tint: "#F6821F" },
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => setWallet(w.key)}
                      className={cn(
                        "press flex items-center gap-3 rounded-sm border p-4 text-left transition-colors",
                        wallet === w.key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                      data-testid={`button-wallet-${w.key}`}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-xs font-bold text-white"
                        style={{ backgroundColor: w.tint }}
                        aria-hidden
                      >
                        {w.name[0]}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-foreground">{w.name}</span>
                        <span className="block text-xs tabular-nums text-muted-foreground">
                          {w.number}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {wallet && (
                  <div className="mt-6 space-y-4 border-t border-border pt-5">
                    <div className="rounded-sm bg-muted/70 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Send exactly {taka(total)} using Send Money
                      </p>
                      <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                        <li>
                          1. Open your {wallet === "bkash" ? "bKash" : "Nagad"} app and choose{" "}
                          <strong className="text-foreground">Send Money</strong> (personal, not
                          Payment).
                        </li>
                        <li>
                          2. Send{" "}
                          <strong className="text-foreground">{taka(total)}</strong> to the number
                          below.
                        </li>
                        <li>
                          3. Copy the Transaction ID from the confirmation SMS and paste it here.
                        </li>
                      </ol>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <CopyField
                        label={`${wallet === "bkash" ? "bKash" : "Nagad"} number`}
                        value={wallet === "bkash" ? BRAND.bkash : BRAND.nagad}
                      />
                      <CopyField label="Amount to send" value={taka(total)} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="txn">Transaction ID</Label>
                        <Input
                          id="txn"
                          required
                          minLength={6}
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          placeholder="e.g. 9F2K7QX1LM"
                          className="mt-1.5 h-11 rounded-sm font-mono tracking-wide"
                          data-testid="input-transaction-id"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sender">Number you sent from (optional)</Label>
                        <Input
                          id="sender"
                          inputMode="tel"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="mt-1.5 h-11 rounded-sm"
                          data-testid="input-sender-number"
                        />
                      </div>
                    </div>

                    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      Your order is created with the status “Pending verification”. We check the
                      transaction against our account manually and email your invoice the moment
                      it clears — usually within a few hours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-xl text-foreground">Your order</h2>

            <ul className="mt-5 space-y-3.5">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.variant ?? ""}`} className="flex gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={imgSrc(l.image ?? "/images/hero-main.webp")}
                      alt=""
                      className="h-14 w-14 rounded-sm border border-border object-cover"
                    />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.6rem] text-background">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{l.title}</p>
                    {l.variant && (
                      <p className="text-[0.7rem] text-muted-foreground">{l.variant}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-foreground">
                    {taka(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{taka(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Delivery {shipping === 0 ? "" : `· ${form.city}`}
                </dt>
                <dd data-testid="text-shipping">{shipping === 0 ? "Free" : taka(shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-foreground">Total</dt>
                <dd className="font-serif text-2xl text-primary" data-testid="text-total">
                  {taka(total)}
                </dd>
              </div>
            </dl>

            <Button
              type="submit"
              disabled={submitting}
              className="press mt-6 h-12 w-full rounded-sm"
              data-testid="button-place-order"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing order…
                </>
              ) : payMode === "cod" ? (
                `Place order · ${taka(total)}`
              ) : (
                "Submit payment for verification"
              )}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
              <Lock className="h-3 w-3" />
              Your details are only used to deliver this order.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}