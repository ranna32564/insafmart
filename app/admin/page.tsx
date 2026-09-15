"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Banknote,
  Boxes,
  CalendarDays,
  Check,
  Loader2,
  LogOut,
  Mail,
  Package,
  Pencil,
  Printer,
  Plus,
  Search,
  ShieldAlert,
  Download,
  RefreshCw,
  Trash2,
  Users,
  UserRound,
  X,
} from "lucide-react";
import type { OrderView, ProductView } from "@/lib/schema";
import { StatusBadge } from "@/components/status-badge";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, getAuthToken, queryClient } from "@/lib/query-client";
import { BRAND, CATEGORY_META, PAYMENT_LABEL, taka } from "@/lib/brand";
import { imgSrc } from "@/lib/use-store";
import { cn } from "@/lib/utils";

type Stats = {
  totalOrders: number;
  pendingVerification: number;
  revenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStock: number;
  todayOrders: number;
  todayRevenue: number;
  monthRevenue: number;
  topProducts: { title: string; quantity: number; revenue: number }[];
  recentOrders: { id: number; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[];
};

type Customer = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  spent: number;
};

const NEXT_STATUS: Record<string, { label: string; status: string }[]> = {
  pending_verification: [
    { label: "Approve payment", status: "confirmed" },
    { label: "Reject payment", status: "rejected" },
  ],
  pending: [
    { label: "Confirm order", status: "confirmed" },
    { label: "Cancel", status: "cancelled" },
  ],
  confirmed: [
    { label: "Mark shipped", status: "shipped" },
    { label: "Cancel", status: "cancelled" },
  ],
  shipped: [{ label: "Mark delivered", status: "delivered" }],
  delivered: [],
  rejected: [{ label: "Re-open as pending", status: "pending_verification" }],
  cancelled: [],
};

/* ------------------------------- admin login ------------------------------ */

function AdminLogin() {
  const { adminLogin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin(email.trim(), password);
      toast({ title: "Signed in", description: "Welcome to the Insaf Mart admin panel." });
    } catch (err) {
      toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20">
      <div className="flex justify-center">
        <Logo className="h-9 text-primary" />
      </div>
      <div className="mt-10 rounded-md border border-border bg-card p-7">
        <p className="eyebrow text-primary">Staff only</p>
        <h1 className="mt-3 font-serif text-2xl text-foreground">Admin panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the store's admin email and password to verify payments and manage stock.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="ad-email">Admin email</Label>
            <Input
              id="ad-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-11 rounded-sm"
              data-testid="input-admin-email"
            />
          </div>
          <div>
            <Label htmlFor="ad-pass">Password</Label>
            <Input
              id="ad-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-11 rounded-sm"
              data-testid="input-admin-password"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="press h-12 w-full rounded-sm"
            data-testid="button-admin-login"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          <span className="min-w-0">
            Credentials come from <code className="font-mono">ADMIN_EMAIL</code> and{" "}
            <code className="font-mono">ADMIN_PASSWORD</code> in your{" "}
            <code className="font-mono">.env</code>. Change them before going live.
          </span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- dashboard ------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint?: string;
  tone?: "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card p-5",
        tone === "accent" ? "border-gold/40 bg-gold/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("h-4 w-4", tone === "accent" ? "text-gold" : "text-primary")} />
      </div>
      <p className="mt-3 font-serif text-3xl text-foreground" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------------------------------- orders -------------------------------- */

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportOrdersCsv(orders: OrderView[]) {
  const rows = [
    ["Order", "Date", "Customer", "Email", "Phone", "Payment", "Status", "Subtotal", "Shipping", "Total", "City", "Address"],
    ...orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      o.customerName,
      o.email,
      o.phone,
      PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod,
      o.status,
      o.subtotal,
      o.shipping,
      o.total,
      o.city,
      `${o.address}${o.area ? `, ${o.area}` : ""}`,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `insaf-mart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printOrder(order: OrderView) {
  const win = window.open("", "_blank", "width=900,height=760");
  if (!win) return;
  const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  win.document.write(`<!doctype html><html><head><title>Invoice ${esc(order.orderNumber)}</title><style>
    body{font-family:Arial,sans-serif;color:#1c1a17;max-width:760px;margin:40px auto;padding:0 24px}h1{font-family:Georgia,serif;font-weight:400;color:#6e1a2b}small{color:#6b6760}.row{display:flex;justify-content:space-between;border-bottom:1px solid #e4dfd7;padding:10px 0}.total{font-size:18px;font-weight:700;color:#6e1a2b}.meta{line-height:1.7;color:#6b6760;margin:18px 0} @media print{body{margin:0;max-width:none}}</style></head><body>
    <h1>Insaf Mart</h1><small>Invoice ${esc(order.orderNumber)}</small>
    <div class="meta"><strong>${esc(order.customerName)}</strong><br>${esc(order.email)}<br>${esc(order.phone)}<br>${esc(order.address)}${order.area ? `, ${esc(order.area)}` : ""}, ${esc(order.city)}</div>
    ${order.items.map((i) => `<div class="row"><span>${esc(i.title)}${i.variant ? ` — ${esc(i.variant)}` : ""} × ${i.quantity}</span><span>৳${(i.price * i.quantity).toLocaleString("en-BD")}</span></div>`).join("")}
    <div class="row"><span>Subtotal</span><span>৳${order.subtotal.toLocaleString("en-BD")}</span></div><div class="row"><span>Delivery</span><span>${order.shipping ? `৳${order.shipping.toLocaleString("en-BD")}` : "Free"}</span></div><div class="row total"><span>Total</span><span>৳${order.total.toLocaleString("en-BD")}</span></div>
    <p class="meta">Payment: ${esc(PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod)}<br>Status: ${esc(order.status)}</p>
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

function OrdersPanel() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<OrderView | null>(null);
  const [rejectAs, setRejectAs] = useState<"rejected" | "cancelled">("rejected");
  const [note, setNote] = useState("");
  const [noteOrder, setNoteOrder] = useState<OrderView | null>(null);

  const { data: orders = [], isLoading, isError: ordersError, error: ordersErrorValue, refetch } = useQuery<OrderView[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/orders?ts=${Date.now()}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.text();
        let message = body || res.statusText;
        try { const parsed = JSON.parse(body); if (typeof parsed?.message === "string") message = parsed.message; } catch {}
        throw new Error(`Admin orders (${res.status}): ${message}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Admin orders API returned an invalid response.");
      return data as OrderView[];
    },
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let start = "";
    let end = "";
    const today = new Date();
    const isoDay = (d: Date) => d.toISOString().slice(0, 10);
    if (datePreset === "today") start = end = isoDay(today);
    if (datePreset === "month") start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    if (datePreset === "week") {
      const d = new Date(today);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      start = isoDay(d);
    }
    if (datePreset === "custom") { start = fromDate; end = toDate; }
    return orders.filter((o) => {
      const matchesStatus = filter === "all" || o.status === filter;
      const haystack = `${o.orderNumber} ${o.customerName} ${o.email} ${o.phone}`.toLowerCase();
      const day = new Date(o.createdAt).toISOString().slice(0, 10);
      const matchesSearch = !q || haystack.includes(q);
      const matchesStart = !start || day >= start;
      const matchesEnd = !end || day <= end;
      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });
  }, [orders, filter, search, datePreset, fromDate, toDate]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      if (allFilteredSelected) filtered.forEach((o) => next.delete(o.id));
      else filtered.forEach((o) => next.add(o.id));
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function setStatus(order: OrderView, status: string, adminNote?: string) {
    setBusyId(order.id);
    try {
      await apiRequest("PATCH", `/api/admin/orders/${order.id}/status`, { status, adminNote });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: status === "confirmed" ? "Payment approved" : status === "rejected" ? "Payment rejected" : "Status updated", description: `${order.orderNumber} → ${status.replace("_", " ")}.` });
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null); setRejecting(null); setNote(""); setNoteOrder(null);
    }
  }

  async function bulkUpdate() {
    if (!bulkStatus || selected.size === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all([...selected].map((id) => apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status: bulkStatus })));
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Bulk update complete", description: `${selected.size} order(s) → ${bulkStatus.replace("_", " ")}.` });
      setSelected(new Set()); setBulkStatus("");
    } catch (err) {
      toast({ title: "Bulk update failed", description: (err as Error).message, variant: "destructive" });
    } finally { setBulkBusy(false); }
  }

  const TABS = [
    { key: "pending_verification", label: "Pending verification" },
    { key: "pending", label: "COD pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All orders" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer, email or phone…" className="h-10 rounded-sm pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "today", "week", "month", "custom"] as const).map((p) => (
            <Button key={p} variant={datePreset === p ? "default" : "outline"} className="h-10 rounded-sm text-xs" onClick={() => setDatePreset(p)}>
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />{p === "all" ? "All dates" : p === "today" ? "Today" : p === "week" ? "This week" : p === "month" ? "This month" : "Custom"}
            </Button>
          ))}
        </div>
      </div>
      {datePreset === "custom" && (
        <div className="mt-3 flex flex-wrap gap-3">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-auto rounded-sm" aria-label="From date" />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-auto rounded-sm" aria-label="To date" />
        </div>
      )}

      <div className="mt-5 no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const n = t.key === "all" ? orders.length : orders.filter((o) => o.status === t.key).length;
          return <button key={t.key} onClick={() => setFilter(t.key)} className={cn("press shrink-0 rounded-sm border px-3.5 py-2 text-xs transition-colors", filter === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40")} data-testid={`tab-orders-${t.key}`}>{t.label}<span className="ml-1.5 tabular-nums opacity-70">{n}</span></button>;
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} /> Select {filtered.length ? `${selected.size}/${filtered.length}` : "orders"}</label>
        <div className="flex flex-wrap gap-2">
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="h-9 rounded-sm border border-input bg-background px-3 text-xs" aria-label="Bulk status">
            <option value="">Bulk status…</option><option value="confirmed">Confirmed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected</option><option value="pending">COD pending</option><option value="pending_verification">Pending verification</option>
          </select>
          <Button size="sm" disabled={bulkBusy || !bulkStatus || selected.size === 0} onClick={bulkUpdate} className="rounded-sm">{bulkBusy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}Apply</Button>
          <Button size="sm" variant="outline" onClick={() => exportOrdersCsv(filtered)} className="rounded-sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export CSV ({filtered.length})</Button>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-sm"><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
        </div>
      </div>

      {ordersError ? <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-8 text-center"><p className="text-sm font-medium">Could not load orders.</p><p className="mt-1 text-xs text-muted-foreground">{(ordersErrorValue as Error)?.message || "Please refresh and try again."}</p></div>
      : isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      : filtered.length === 0 ? <div className="mt-6 rounded-md border border-border bg-card p-12 text-center"><p className="text-sm text-muted-foreground">No orders match the current filters.</p></div>
      : <div className="mt-5 space-y-4">
        {filtered.map((o) => <div key={o.id} className="rounded-md border border-border bg-card" data-testid={`admin-order-${o.orderNumber}`}>
          <div className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="flex min-w-0 gap-3">
              <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="mt-1" aria-label={`Select ${o.orderNumber}`} />
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><p className="font-serif text-lg">{o.orderNumber}</p><StatusBadge status={o.status} /></div><p className="mt-1.5 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {o.customerName} · {o.phone}</p><p className="mt-0.5 text-xs text-muted-foreground">{o.email}</p></div>
            </div>
            <div className="text-right"><p className="font-serif text-xl text-primary">{taka(o.total)}</p><p className="mt-0.5 text-xs text-muted-foreground">{PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod}</p></div>
          </div>
          {o.transactionId && <div className="mx-5 mb-5 rounded-sm border border-gold/40 bg-gold/5 p-4"><p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">Transaction submitted by customer</p><div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1.5"><p className="font-mono text-base tracking-wide">{o.transactionId}</p>{o.senderNumber && <p className="text-xs text-muted-foreground">sent from <span className="text-foreground">{o.senderNumber}</span></p>}<p className="text-xs text-muted-foreground">expected <span className="text-foreground">{taka(o.total)}</span> in {o.paymentMethod === "bkash" ? `bKash ${BRAND.bkash}` : `Nagad ${BRAND.nagad}`}</p></div></div>}
          <div className="grid gap-4 border-t border-border px-5 py-4 text-xs sm:grid-cols-2"><div><p className="text-muted-foreground">Items</p><ul className="mt-1.5 space-y-1 text-foreground">{o.items.map((it, i) => <li key={`${it.slug}-${i}`}>{it.quantity} × {it.title}{it.variant ? ` (${it.variant})` : ""}</li>)}</ul></div><div><p className="text-muted-foreground">Deliver to</p><p className="mt-1.5 leading-relaxed">{o.address}{o.area ? `, ${o.area}` : ""}, {o.city}</p>{o.notes && <p className="mt-1.5 text-muted-foreground">Customer note: {o.notes}</p>}{o.adminNote && <p className="mt-1.5 text-destructive">Internal note: {o.adminNote}</p>}</div></div>
          <div className="border-t border-border px-5 py-3"><p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Order timeline (existing schema)</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs"><span>✓ Placed {new Date(o.createdAt).toLocaleDateString("en-GB")}</span>{o.verifiedAt && <span>✓ Verified {new Date(o.verifiedAt).toLocaleDateString("en-GB")}</span>}<span>• Current: {o.status.replace("_", " ")}</span></div></div>
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4"><Button size="sm" variant="outline" className="rounded-sm" onClick={() => printOrder(o)}><Printer className="mr-1.5 h-3.5 w-3.5" />Print invoice</Button><Button size="sm" variant="outline" className="rounded-sm" onClick={() => { setNoteOrder(o); setNote(o.adminNote ?? ""); }}><Pencil className="mr-1.5 h-3.5 w-3.5" />Internal note</Button>{NEXT_STATUS[o.status]?.map((action) => { const danger = action.status === "rejected" || action.status === "cancelled"; return <Button key={action.status} size="sm" variant={danger ? "outline" : "default"} disabled={busyId === o.id} onClick={() => danger ? (setRejecting(o), setRejectAs(action.status as "rejected" | "cancelled"), setNote("")) : setStatus(o, action.status)} className={cn("press rounded-sm", danger && "border-destructive/40 text-destructive hover:bg-destructive/5")}>{busyId === o.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : danger ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}{action.label}</Button>; })}</div>
        </div>)}
      </div>}

      <Dialog open={Boolean(rejecting)} onOpenChange={(v) => !v && setRejecting(null)}><DialogContent className="rounded-md"><DialogHeader><DialogTitle className="font-serif text-xl">{rejectAs === "cancelled" ? "Cancel this order?" : "Reject this payment?"}</DialogTitle><DialogDescription>{rejecting?.orderNumber} · {rejecting?.customerName}. The customer will be emailed with your reason.</DialogDescription></DialogHeader><div><Label htmlFor="reject-note">Reason</Label><Textarea id="reject-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={rejectAs === "cancelled" ? "Customer asked to cancel / item out of stock…" : "No matching transaction found…"} className="mt-1.5 resize-none rounded-sm" /></div><DialogFooter><Button variant="outline" className="rounded-sm" onClick={() => setRejecting(null)}>Cancel</Button><Button className="rounded-sm" disabled={!note.trim()} onClick={() => rejecting && setStatus(rejecting, rejectAs, note.trim())}>{rejectAs === "cancelled" ? "Cancel and email customer" : "Reject and email customer"}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={Boolean(noteOrder)} onOpenChange={(v) => !v && setNoteOrder(null)}><DialogContent className="rounded-md"><DialogHeader><DialogTitle className="font-serif text-xl">Internal order note</DialogTitle><DialogDescription>{noteOrder?.orderNumber} · visible to staff only.</DialogDescription></DialogHeader><Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Courier note, refund detail, tracking reference…" className="resize-none rounded-sm" /><DialogFooter><Button variant="outline" className="rounded-sm" onClick={() => setNoteOrder(null)}>Close</Button><Button className="rounded-sm" disabled={!noteOrder || busyId === noteOrder.id} onClick={() => noteOrder && setStatus(noteOrder, noteOrder.status, note.trim() || null as any)}>Save note</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

/* -------------------------------- products -------------------------------- */

const BLANK = {
  title: "",
  category: CATEGORY_META[0].slug as string,
  collection: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "10",
  images: "",
  tags: "",
  variants: "",
  featured: false,
  isCombo: false,
};

function ProductsPanel() {
  const { toast } = useToast();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [editing, setEditing] = useState<ProductView | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [busy, setBusy] = useState(false);

  const { data: products = [], isLoading } = useQuery<ProductView[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || `${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category === category;
      const matchesStock = stockFilter === "all" || (stockFilter === "low" ? p.stock <= 20 : p.stock === 0);
      const matchesFeatured = featuredFilter === "all" || (featuredFilter === "featured" ? p.featured === 1 : p.featured === 0);
      return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
    });
  }, [products, term, category, stockFilter, featuredFilter]);

  function openCreate() {
    setForm({ ...BLANK });
    setEditing(null);
    setCreating(true);
  }

  function openEdit(p: ProductView) {
    setForm({
      title: p.title,
      category: p.category,
      collection: p.collection ?? "",
      description: p.description,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock),
      images: p.images.join(", "),
      tags: p.tags.join(", "),
      variants: p.variants.join(", "),
      featured: p.featured === 1,
      isCombo: p.isCombo === 1,
    });
    setEditing(p);
    setCreating(true);
  }

  const split = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: form.title,
      category: form.category,
      collection: form.collection || null,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      images: JSON.stringify(split(form.images).length ? split(form.images) : []),
      tags: JSON.stringify(split(form.tags)),
      variants: JSON.stringify(split(form.variants)),
      featured: form.featured ? 1 : 0,
      isCombo: form.isCombo ? 1 : 0,
    };
    try {
      if (editing) {
        await apiRequest("PATCH", `/api/admin/products/${editing.id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/products", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: editing ? "Product updated" : "Product added",
        description: form.title,
      });
      setCreating(false);
      setEditing(null);
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

  async function remove(p: ProductView) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await apiRequest("DELETE", `/api/admin/products/${p.id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Product deleted", description: p.title });
    } catch (err) {
      toast({
        title: "Could not delete",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search title, slug or category…" className="h-10 rounded-sm pl-10" data-testid="input-admin-product-search" />
        </div>
        <Button onClick={openCreate} className="press h-10 rounded-sm" data-testid="button-add-product"><Plus className="mr-1.5 h-4 w-4" />Add product</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-sm border border-input bg-background px-3 text-xs"><option value="all">All categories</option>{CATEGORY_META.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="h-9 rounded-sm border border-input bg-background px-3 text-xs"><option value="all">All stock</option><option value="low">Low stock ≤ 20</option><option value="zero">Out of stock</option></select>
        <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="h-9 rounded-sm border border-input bg-background px-3 text-xs"><option value="all">All products</option><option value="featured">Featured</option><option value="regular">Not featured</option></select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 text-right font-normal">Price</th>
                <th className="px-4 py-3 text-right font-normal">Stock</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                    data-testid="text-admin-products-empty"
                  >
                    No products match that search.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} data-testid={`admin-product-${p.slug}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={imgSrc(p.images[0] ?? "/images/hero-main.webp")}
                        alt=""
                        className="h-10 w-10 rounded-sm border border-border object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-foreground">{p.title}</p>
                        {p.featured === 1 && (
                          <p className="text-[0.65rem] uppercase tracking-[0.1em] text-gold">
                            Featured
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{taka(p.price)}</td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums",
                      p.stock === 0
                        ? "text-destructive"
                        : p.stock <= 8
                          ? "text-gold"
                          : "text-foreground",
                    )}
                  >
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.title}`}
                        className="press rounded-sm border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
                        data-testid={`button-edit-${p.slug}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        aria-label={`Delete ${p.title}`}
                        className="press rounded-sm border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                        data-testid={`button-delete-${p.slug}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? "Edit product" : "Add a product"}
            </DialogTitle>
            <DialogDescription>
              Comma-separate image paths, tags and variants. Image paths are relative, e.g.{" "}
              <code className="font-mono">./images/royal-oud-attar.webp</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="p-title">Title</Label>
              <Input
                id="p-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 h-11 rounded-sm"
                data-testid="input-product-title"
              />
            </div>
            <div>
              <Label htmlFor="p-cat">Category</Label>
              <select
                id="p-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm"
                data-testid="select-product-category"
              >
                {CATEGORY_META.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="p-collection">Collection label (optional)</Label>
              <Input
                id="p-collection"
                value={form.collection}
                onChange={(e) => setForm({ ...form, collection: e.target.value })}
                placeholder="Gents Attar"
                className="mt-1.5 h-11 rounded-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 resize-none rounded-sm"
                data-testid="input-product-description"
              />
            </div>
            <div>
              <Label htmlFor="p-price">Price (৳)</Label>
              <Input
                id="p-price"
                required
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1.5 h-11 rounded-sm"
                data-testid="input-product-price"
              />
            </div>
            <div>
              <Label htmlFor="p-compare">Compare-at price (optional)</Label>
              <Input
                id="p-compare"
                inputMode="numeric"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                className="mt-1.5 h-11 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="p-stock">Stock count</Label>
              <Input
                id="p-stock"
                required
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1.5 h-11 rounded-sm"
                data-testid="input-product-stock"
              />
            </div>
            <div>
              <Label htmlFor="p-variants">Variants</Label>
              <Input
                id="p-variants"
                value={form.variants}
                onChange={(e) => setForm({ ...form, variants: e.target.value })}
                placeholder="3 ml, 6 ml, 12 ml"
                className="mt-1.5 h-11 rounded-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-images">Image paths</Label>
              <Input
                id="p-images"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="/images/my-product.webp"
                className="mt-1.5 h-11 rounded-sm font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-tags">Tags / search keywords</Label>
              <Input
                id="p-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="attar, oud, gents, gift"
                className="mt-1.5 h-11 rounded-sm"
              />
            </div>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 accent-[hsl(348_62%_27%)]"
                />
                Feature on homepage
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.isCombo}
                  onChange={(e) => setForm({ ...form, isCombo: e.target.checked })}
                  className="h-4 w-4 accent-[hsl(348_62%_27%)]"
                />
                This is a gift combo box
              </label>
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-sm"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-sm"
                data-testid="button-save-product"
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------- customers ------------------------------- */

function CustomersPanel() {
  const { data: customers = [], isLoading } = useQuery<Customer[]>({ queryKey: ["/api/admin/customers"] });
  const { data: orders = [] } = useQuery<OrderView[]>({ queryKey: ["/api/admin/orders"] });
  const [customer, setCustomer] = useState<Customer | null>(null);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (customers.length === 0) return <div className="rounded-md border border-border bg-card p-12 text-center"><p className="text-sm text-muted-foreground">No registered customers yet. Guests who order without signing in appear under Orders.</p></div>;

  const history = customer ? orders.filter((o) => o.userId === customer.id || o.email.toLowerCase() === customer.email.toLowerCase()) : [];

  return <>
    <div className="overflow-x-auto rounded-md border border-border"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase tracking-[0.1em] text-muted-foreground"><tr><th className="px-4 py-3 font-normal">Customer</th><th className="px-4 py-3 font-normal">Joined</th><th className="px-4 py-3 text-right font-normal">Orders</th><th className="px-4 py-3 text-right font-normal">Spent</th></tr></thead><tbody className="divide-y divide-border bg-card">{customers.map((c) => <tr key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setCustomer(c)} data-testid={`admin-customer-${c.id}`}><td className="px-4 py-3"><p className="text-foreground">{c.name || "—"}</p><p className="text-xs text-muted-foreground">{c.email}</p>{c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}</td><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td><td className="px-4 py-3 text-right tabular-nums">{c.orderCount}</td><td className="px-4 py-3 text-right tabular-nums text-primary">{taka(c.spent)}</td></tr>)}</tbody></table></div>
    <Dialog open={Boolean(customer)} onOpenChange={(v) => !v && setCustomer(null)}><DialogContent className="max-w-2xl rounded-md"><DialogHeader><DialogTitle className="font-serif text-xl">Customer details</DialogTitle><DialogDescription>{customer?.name} · {customer?.email}{customer?.phone ? ` · ${customer.phone}` : ""}</DialogDescription></DialogHeader><div className="max-h-[60vh] overflow-y-auto space-y-3">{history.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No order history found.</p> : history.map((o) => <div key={o.id} className="rounded-sm border border-border p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-serif">{o.orderNumber}</p><p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")}</p></div><div className="text-right"><StatusBadge status={o.status} /><p className="mt-1 text-sm text-primary">{taka(o.total)}</p></div></div><ul className="mt-3 space-y-1 text-xs">{o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.title}{i.variant ? ` (${i.variant})` : ""}</li>)}</ul></div>)}</div></DialogContent></Dialog>
  </>;
}

/* ---------------------------------- outbox -------------------------------- */

function OutboxPanel() {
  const { data } = useQuery<{
    mailEnabled: boolean;
    messages: { to: string; subject: string; sentAt: string }[];
  }>({ queryKey: ["/api/admin/outbox"] });

  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-medium text-foreground">Email delivery</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {data?.mailEnabled
              ? `Live — sending through Gmail as ${BRAND.email}.`
              : "Preview mode — EMAIL_USER and EMAIL_APP_PASSWORD are not set, so emails are logged here instead of being delivered. Add them to .env to switch on real delivery."}
          </p>
        </div>
      </div>

      {(data?.messages?.length ?? 0) > 0 && (
        <ul className="mt-5 divide-y divide-border border-t border-border text-xs">
          {data!.messages
            .slice()
            .reverse()
            .map((m, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="text-foreground">{m.subject}</span>
                <span className="text-muted-foreground">
                  → {m.to} ·{" "}
                  {new Date(m.sentAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------------- page --------------------------------- */

export default function Admin() {
  const { user, isLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats, isError: statsError, error: statsErrorValue } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: Boolean(user?.isAdmin) && mounted,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !user.isAdmin) return <AdminLogin />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Admin panel</p>
          <h1 className="mt-2 font-serif text-3xl text-foreground">Store overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <Button
          variant="outline"
          className="press rounded-sm"
          onClick={() => signOut()}
          data-testid="button-admin-signout"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>

      {statsError && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-foreground">Dashboard data could not be loaded.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(statsErrorValue as Error)?.message || "Please refresh and try again."}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total orders" value={String(stats?.totalOrders ?? 0)} hint={`${stats?.totalCustomers ?? 0} registered customers · cancelled included`} />
        <StatCard icon={CalendarDays} label="Today's orders" value={String(stats?.todayOrders ?? 0)} hint={taka(stats?.todayRevenue ?? 0)} />
        <StatCard icon={BadgeCheck} label="Pending verification" value={String(stats?.pendingVerification ?? 0)} hint="Awaiting bKash / Nagad check" tone={stats?.pendingVerification ? "accent" : undefined} />
        <StatCard icon={Banknote} label="Revenue" value={taka(stats?.revenue ?? 0)} hint="Confirmed, shipped and delivered" />
        <StatCard icon={Banknote} label="This month's revenue" value={taka(stats?.monthRevenue ?? 0)} hint="Confirmed, shipped and delivered" />
        <StatCard icon={Boxes} label="Products" value={String(stats?.totalProducts ?? 0)} hint={`${stats?.lowStock ?? 0} low/out of stock`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between"><div><p className="eyebrow text-primary">Top sellers</p><h2 className="mt-1 font-serif text-xl">Best-selling products</h2></div><span className="text-xs text-muted-foreground">Confirmed+ fulfilled</span></div>
          <div className="mt-5 space-y-3">
            {(stats?.topProducts ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No completed sales yet.</p> : stats!.topProducts.map((p, i) => {
              const max = stats!.topProducts[0]?.quantity || 1;
              return <div key={`${p.title}-${i}`}><div className="flex justify-between gap-3 text-xs"><span className="truncate">{i + 1}. {p.title}</span><span className="tabular-nums text-muted-foreground">{p.quantity} sold · {taka(p.revenue)}</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(8, (p.quantity / max) * 100)}%` }} /></div></div>;
            })}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between"><div><p className="eyebrow text-primary">Live feed</p><h2 className="mt-1 font-serif text-xl">Recent orders</h2></div><span className="text-xs text-muted-foreground">auto-refresh 5s</span></div>
          <div className="mt-4 divide-y divide-border">
            {(stats?.recentOrders ?? []).map((o) => <div key={o.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm">{o.orderNumber} · {o.customerName}</p><p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div><div className="text-right"><p className="text-sm text-primary">{taka(o.total)}</p><StatusBadge status={o.status} /></div></div>)}
            {(stats?.recentOrders ?? []).length === 0 && <p className="py-5 text-sm text-muted-foreground">No orders yet.</p>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList className="rounded-sm">
          <TabsTrigger value="orders" className="rounded-sm" data-testid="tab-admin-orders">
            <Package className="mr-1.5 h-3.5 w-3.5" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-sm" data-testid="tab-admin-products">
            <Boxes className="mr-1.5 h-3.5 w-3.5" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-sm" data-testid="tab-admin-customers">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="email" className="rounded-sm" data-testid="tab-admin-email">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="orders" className="mt-6">
          <OrdersPanel />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductsPanel />
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
          <CustomersPanel />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <OutboxPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
