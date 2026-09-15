"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, Package, Printer, Search, User as UserIcon } from "lucide-react";
import type { OrderView } from "@/lib/schema";
import { PageHeader } from "@/components/site-layout";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { BRAND, PAYMENT_LABEL, taka, waLink } from "@/lib/brand";

const STEPS = ["confirmed", "shipped", "delivered"] as const;

function OrderCard({ order }: { order: OrderView }) {
  const [open, setOpen] = useState(false);
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const dead = order.status === "rejected" || order.status === "cancelled";

  const items = order.items ?? [];
  const itemCount = items.length;

  return (
    <div className="rounded-md border border-border bg-card" data-testid={`card-order-${order.orderNumber}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div>
          <p className="font-serif text-lg text-foreground">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
            {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          <span className="font-serif text-lg text-primary">{taka(order.total)}</span>
        </div>
      </div>

      {!dead && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-border"}`}
                />
                <p
                  className={`mt-1.5 text-[0.62rem] uppercase tracking-[0.1em] ${
                    i <= stepIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>
          {order.status === "pending_verification" && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Waiting on manual payment verification for transaction{" "}
              <strong className="text-foreground">{order.transactionId}</strong>.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border px-5 py-3.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-primary hover:underline"
          data-testid={`button-toggle-${order.orderNumber}`}
        >
          {open ? "Hide details" : "View details & invoice"}
        </button>
        <a
          href={waLink(
            BRAND.whatsapp[1].number,
            `Hello Insaf Mart, I'd like an update on order ${order.orderNumber}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Ask about this order
        </a>
      </div>

      {open && (
        <div className="border-t border-border bg-background/60 p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-primary">Invoice {order.orderNumber}</p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>

          <table className="mt-4 w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 font-normal">Item</th>
                <th className="pb-2 text-center font-normal">Qty</th>
                <th className="pb-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it, i) => (
                <tr key={`${it.slug}-${i}`}>
                  <td className="py-2.5 pr-3 text-foreground">
                    {it.title}
                    {it.variant && (
                      <span className="text-muted-foreground"> · {it.variant}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center tabular-nums">{it.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {taka(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 text-right text-muted-foreground">
                  Subtotal
                </td>
                <td className="pt-3 text-right tabular-nums">{taka(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1.5 text-right text-muted-foreground">
                  Delivery
                </td>
                <td className="pt-1.5 text-right tabular-nums">
                  {order.shipping === 0 ? "Free" : taka(order.shipping)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-2.5 text-right text-foreground">
                  Total
                </td>
                <td className="pt-2.5 text-right font-serif text-base text-primary">
                  {taka(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-5 grid gap-4 border-t border-border pt-4 text-xs sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Deliver to</p>
              <p className="mt-1 leading-relaxed text-foreground">
                {order.customerName}
                <br />
                {order.address}
                {order.area ? `, ${order.area}` : ""}
                <br />
                {order.city} · {order.phone}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment</p>
              <p className="mt-1 leading-relaxed text-foreground">
                {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                {order.transactionId && (
                  <>
                    <br />
                    Txn: {order.transactionId}
                  </>
                )}
                {order.senderNumber && (
                  <>
                    <br />
                    From: {order.senderNumber}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}function TrackPanel() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiRequest("GET", `/api/orders/track/${number.trim().toUpperCase()}`);
      setResult((await res.json()) as OrderView);
    } catch (err) {
      setError((err as Error).message || "We could not find that order number.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <h3 className="font-serif text-xl text-foreground">Track any order</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Ordered as a guest? Enter the order number from your confirmation email.
      </p>
      <form onSubmit={track} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value.toUpperCase())}
          placeholder="IM-260911-0001"
          className="h-11 rounded-sm font-mono"
          required
        />
        <Button type="submit" disabled={busy} className="press h-11 rounded-sm sm:px-7">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2">Track</span>
        </Button>
      </form>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {result && (
        <div className="mt-5">
          <OrderCard order={result} />
        </div>
      )}
    </div>
  );
}

function ProfilePanel() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile({ name, phone, address });
      toast({ title: "Profile saved", description: "We'll use these details at checkout." });
    } catch (err) {
      toast({
        title: "Could not save",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <h3 className="font-serif text-xl text-foreground">Your details</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as <strong className="text-foreground">{user?.email}</strong>
      </p>

      <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pf-name">Full name</Label>
          <Input
            id="pf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-11 rounded-sm"
          />
        </div>
        <div>
          <Label htmlFor="pf-phone">Mobile number</Label>
          <Input
            id="pf-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 h-11 rounded-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pf-address">Default delivery address</Label>
          <Textarea
            id="pf-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 resize-none rounded-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit" disabled={busy} className="press rounded-sm">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save details
          </Button>
          <Button
            type="button"
            variant="outline"
            className="press rounded-sm"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Account() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorValue,
  } = useQuery<OrderView[]>({
    queryKey: ["/api/orders/mine"],
    enabled: Boolean(user) && mounted,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader
          eyebrow="My account"
          title="Sign in to see your orders"
          description="Or track a single order with its order number — no account needed."
        />
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              We use email codes instead of passwords. Sign in once and your invoices and order
              history stay here.
            </p>
            <Button
              className="press rounded-sm"
              onClick={() => router.push("/signin")}
            >
              Sign in with email
            </Button>
          </div>
          <TrackPanel />
        </div>
      </>
    );
  }

  const pending = (orders ?? []).filter(
    (o) => o.status === "pending" || o.status === "pending_verification",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title={`Hello, ${user.name || user.email.split("@")[0]}`}
        description={
          pending > 0
            ? `You have ${pending} order${pending === 1 ? "" : "s"} waiting on payment verification.`
            : "Your orders, invoices and delivery details in one place."
        }
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <Tabs defaultValue="orders">
          <TabsList className="rounded-sm">
            <TabsTrigger value="orders" className="rounded-sm">
              Orders
            </TabsTrigger>
            <TabsTrigger value="track" className="rounded-sm">
              Track
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 space-y-4">
            {ordersError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm font-medium text-foreground">Could not load your orders.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(ordersErrorValue as Error)?.message || "Please refresh and try again."}
                </p>
              </div>
            ) : ordersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (orders ?? []).length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">No orders yet.</p>
                <Link href="/shop">
                  <Button className="press rounded-sm">Start shopping</Button>
                </Link>
              </div>
            ) : (
              (orders ?? []).map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </TabsContent>

          <TabsContent value="track" className="mt-6">
            <TrackPanel />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfilePanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}