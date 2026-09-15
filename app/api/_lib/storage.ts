import { supabaseAdmin } from "@/lib/supabase";
import { countCustomers } from "@/lib/api-auth";
import type {
  InsertProduct,
  OrderItem,
  OrderStatus,
  OrderView,
  ProductView,
} from "@/lib/schema";

/**
 * Products and orders data layer — the Supabase/Postgres port of the reference
 * `server/storage.ts`. Users, OTP codes and sessions live in `lib/api-auth.ts`.
 *
 * Every value that leaves this module is shaped exactly like the Drizzle/SQLite
 * rows the Express build returned: camelCase keys, 0/1 integers instead of
 * booleans, ISO-8601 timestamp strings, and `images`/`tags`/`variants`/`items`
 * already parsed into arrays.
 */

/* ------------------------------- serialisers ------------------------------ */

type ProductRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  collection: string | null;
  description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  images: unknown;
  tags: unknown;
  variants: unknown;
  featured: number;
  is_combo: number;
  created_at: string;
};

type OrderRow = {
  id: number;
  order_number: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string | null;
  notes: string | null;
  payment_method: string;
  transaction_id: string | null;
  sender_number: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  items: unknown;
  admin_note: string | null;
  created_at: string;
  verified_at: string | null;
};

const iso = (value: string | null): string | null =>
  value ? new Date(value).toISOString() : null;

/** jsonb columns arrive parsed, but tolerate a JSON string too. */
function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toProductView(row: ProductRow): ProductView {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    category: row.category,
    collection: row.collection,
    description: row.description,
    price: Number(row.price),
    comparePrice: row.compare_price === null ? null : Number(row.compare_price),
    stock: Number(row.stock),
    images: asArray<string>(row.images),
    tags: asArray<string>(row.tags),
    variants: asArray<string>(row.variants),
    featured: Number(row.featured),
    isCombo: Number(row.is_combo),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

export function toOrderView(row: OrderRow): OrderView {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    userId: row.user_id === null ? null : Number(row.user_id),
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    area: row.area,
    notes: row.notes,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    senderNumber: row.sender_number,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    items: asArray<OrderItem>(row.items),
    adminNote: row.admin_note,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    verifiedAt: iso(row.verified_at),
  };
}

/* --------------------------------- slugify -------------------------------- */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  let candidate = slugify(base) || `item-${Date.now()}`;
  let n = 1;
  for (;;) {
    const { data } = await supabaseAdmin()
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || Number((data as { id: number }).id) === ignoreId) return candidate;
    candidate = `${slugify(base)}-${++n}`;
  }
}

/* -------------------------------- products -------------------------------- */

/** Featured first, then insertion order — same as the reference. */
export async function listProducts(): Promise<ProductView[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .order("featured", { ascending: false })
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => toProductView(row as ProductRow));
}

export async function getProduct(id: number): Promise<ProductView | undefined> {
  const { data } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? toProductView(data as ProductRow) : undefined;
}

export async function getProductBySlug(slug: string): Promise<ProductView | undefined> {
  const { data } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? toProductView(data as ProductRow) : undefined;
}

/** The admin form posts JSON strings for the array columns, as in the reference. */
function toJsonArray(raw: string | undefined, fallback: unknown[] = []): unknown[] {
  if (raw === undefined) return fallback;
  if (typeof raw !== "string") return Array.isArray(raw) ? raw : fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function createProduct(input: InsertProduct): Promise<ProductView> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .insert({
      slug: await uniqueSlug(input.slug || input.title),
      title: input.title,
      category: input.category,
      collection: input.collection ?? null,
      description: input.description,
      price: input.price,
      compare_price: input.comparePrice ?? null,
      stock: input.stock ?? 0,
      images: toJsonArray(input.images),
      tags: toJsonArray(input.tags),
      variants: toJsonArray(input.variants),
      featured: input.featured ?? 0,
      is_combo: input.isCombo ?? 0,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Could not create the product.");
  return toProductView(data as ProductRow);
}

export async function updateProduct(
  id: number,
  input: Partial<InsertProduct>,
): Promise<ProductView | undefined> {
  const { data: existingRow } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!existingRow) return undefined;
  const existing = toProductView(existingRow as ProductRow);

  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) {
    patch.title = input.title;
    // Re-slug only when the caller did not pin one and the title changed.
    if (input.slug === undefined && input.title !== existing.title) {
      patch.slug = await uniqueSlug(input.title, id);
    }
  }
  if (input.slug !== undefined) patch.slug = await uniqueSlug(input.slug, id);
  if (input.category !== undefined) patch.category = input.category;
  if (input.collection !== undefined) patch.collection = input.collection;
  if (input.description !== undefined) patch.description = input.description;
  if (input.price !== undefined) patch.price = input.price;
  if (input.comparePrice !== undefined) patch.compare_price = input.comparePrice;
  if (input.stock !== undefined) patch.stock = input.stock;
  if (input.images !== undefined) patch.images = toJsonArray(input.images);
  if (input.tags !== undefined) patch.tags = toJsonArray(input.tags);
  if (input.variants !== undefined) patch.variants = toJsonArray(input.variants);
  if (input.featured !== undefined) patch.featured = input.featured;
  if (input.isCombo !== undefined) patch.is_combo = input.isCombo;

  if (Object.keys(patch).length === 0) return existing;

  const { data } = await supabaseAdmin()
    .from("products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  return data ? toProductView(data as ProductRow) : undefined;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");
  return (data ?? []).length > 0;
}

/* --------------------------------- orders --------------------------------- */

export type NewOrder = Omit<OrderView, "id">;

export async function createOrder(data: NewOrder): Promise<OrderView> {
  const db = supabaseAdmin();
  const { data: row, error } = await db
    .from("orders")
    .insert({
      order_number: data.orderNumber,
      user_id: data.userId,
      customer_name: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      area: data.area,
      notes: data.notes,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      sender_number: data.senderNumber,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      status: data.status,
      items: data.items,
      admin_note: data.adminNote,
      created_at: data.createdAt,
      verified_at: data.verifiedAt,
    })
    .select("*")
    .single();

  if (error || !row) throw error ?? new Error("Could not save the order.");
  const order = toOrderView(row as OrderRow);

  // Normalised mirror for SQL reporting; `orders.items` stays authoritative.
  if (order.items.length) {
    await db.from("order_items").insert(
      order.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        slug: i.slug,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        variant: i.variant ?? null,
        image: i.image ?? null,
      })),
    );
  }

  return order;
}

export async function listOrders(): Promise<OrderView[]> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toOrderView(row as OrderRow));
}

export async function listOrdersByUserId(userId: number): Promise<OrderView[]> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toOrderView(row as OrderRow));
}

export async function listOrdersByEmail(email: string): Promise<OrderView[]> {
  const normalized = email.toLowerCase().trim();
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .ilike("email", normalized)
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toOrderView(row as OrderRow));
}

export async function getOrder(id: number): Promise<OrderView | undefined> {
  const { data } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? toOrderView(data as OrderRow) : undefined;
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderView | undefined> {
  const { data } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber.trim().toUpperCase())
    .maybeSingle();
  return data ? toOrderView(data as OrderRow) : undefined;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  adminNote?: string | null,
): Promise<OrderView | undefined> {
  const patch: Record<string, unknown> = { status };
  if (adminNote !== undefined) patch.admin_note = adminNote;
  if (status === "confirmed") patch.verified_at = new Date().toISOString();

  const { data } = await supabaseAdmin()
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  return data ? toOrderView(data as OrderRow) : undefined;
}

/** MAX(0, stock - quantity) per line, mirroring the reference. */
export async function decrementStock(items: OrderItem[]): Promise<void> {
  const db = supabaseAdmin();
  for (const item of items) {
    const { data } = await db
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .maybeSingle();
    if (!data) continue;
    const stock = Number((data as { stock: number }).stock);
    await db
      .from("products")
      .update({ stock: Math.max(0, stock - item.quantity) })
      .eq("id", item.productId);
  }
}

/* ---------------------------------- stats --------------------------------- */

export type AdminStats = {
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

export async function stats(): Promise<AdminStats> {
  const db = supabaseAdmin();

  const [orderRes, productRes, totalCustomers] = await Promise.all([
    db.from("orders").select("id, order_number, customer_name, status, total, created_at, items"),
    db.from("products").select("stock"),
    countCustomers(),
  ]);

  if (orderRes.error) throw orderRes.error;
  if (productRes.error) throw productRes.error;

  const orderRows = (orderRes.data ?? []) as {
    id: number; order_number: string; customer_name: string; status: string; total: number;
    created_at: string; items: unknown;
  }[];
  const productRows = (productRes.data ?? []) as { stock: number }[];
  const revenueStatuses = new Set(["confirmed", "shipped", "delivered"]);
  const revenue = orderRows
    .filter((o) => revenueStatuses.has(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const bdDate = (isoDate: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(isoDate));
  const bdMonth = (isoDate: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit" }).format(new Date(isoDate));
  const now = new Date();
  const todayKey = bdDate(now.toISOString());
  const monthKey = bdMonth(now.toISOString());

  const todayRows = orderRows.filter((o) => bdDate(o.created_at) === todayKey);
  const monthRows = orderRows.filter((o) => bdMonth(o.created_at) === monthKey);
  const todayRevenue = todayRows
    .filter((o) => revenueStatuses.has(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const monthRevenue = monthRows
    .filter((o) => revenueStatuses.has(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const productMap = new Map<string, { title: string; quantity: number; revenue: number }>();
  for (const order of orderRows) {
    if (!revenueStatuses.has(order.status)) continue;
    for (const item of asArray<OrderItem>(order.items)) {
      const current = productMap.get(item.productId + ":" + item.title) ?? { title: item.title, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      productMap.set(item.productId + ":" + item.title, current);
    }
  }

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 5);

  const recentOrders = [...orderRows]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)
    .map((o) => ({
      id: Number(o.id),
      orderNumber: o.order_number,
      customerName: o.customer_name,
      total: Number(o.total),
      status: o.status,
      createdAt: iso(o.created_at) ?? new Date().toISOString(),
    }));

  return {
    totalOrders: orderRows.length,
    pendingVerification: orderRows.filter((o) => o.status === "pending_verification").length,
    revenue,
    totalProducts: productRows.length,
    totalCustomers,
    lowStock: productRows.filter((p) => Number(p.stock) <= 20).length,
    todayOrders: todayRows.length,
    todayRevenue,
    monthRevenue,
    topProducts,
    recentOrders,
  };
}
