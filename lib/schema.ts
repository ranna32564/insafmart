import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ---------------------------------- Users --------------------------------- */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  passwordHash: text("password_hash"),
  isVerified: integer("is_verified").notNull().default(0),
  isAdmin: integer("is_admin").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  isAdmin: true,
  passwordHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/* ------------------------------- OTP codes -------------------------------- */

export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  consumed: integer("consumed").notNull().default(0),
});

export type OtpCode = typeof otpCodes.$inferSelect;

/* -------------------------------- Sessions -------------------------------- */

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export type Session = typeof sessions.$inferSelect;

/* -------------------------------- Products -------------------------------- */

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  collection: text("collection"),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  comparePrice: integer("compare_price"),
  stock: integer("stock").notNull().default(0),
  /** JSON string[] — SQLite has no array columns */
  images: text("images").notNull().default("[]"),
  /** JSON string[] */
  tags: text("tags").notNull().default("[]"),
  /** JSON string[] of variant labels, e.g. ["3 ml","6 ml","12 ml"] */
  variants: text("variants").notNull().default("[]"),
  featured: integer("featured").notNull().default(0),
  isCombo: integer("is_combo").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().min(2, "Title is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(5, "Description is required"),
    price: z.coerce.number().int().min(1, "Price must be above 0"),
    comparePrice: z.coerce.number().int().nullable().optional(),
    stock: z.coerce.number().int().min(0),
    slug: z.string().min(2).optional(),
    images: z.string().optional(),
    tags: z.string().optional(),
    variants: z.string().optional(),
    featured: z.coerce.number().int().optional(),
    isCombo: z.coerce.number().int().optional(),
    collection: z.string().nullable().optional(),
  });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

/** Product shape after JSON columns are parsed — what the client consumes. */
export type ProductView = Omit<Product, "images" | "tags" | "variants"> & {
  images: string[];
  tags: string[];
  variants: string[];
};

/* --------------------------------- Orders --------------------------------- */

export const ORDER_STATUSES = [
  "pending_verification",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "rejected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["cod", "bkash", "nagad"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  area: text("area"),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  senderNumber: text("sender_number"),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull(),
  /** JSON OrderItem[] */
  items: text("items").notNull().default("[]"),
  adminNote: text("admin_note"),
  createdAt: text("created_at").notNull(),
  verifiedAt: text("verified_at"),
});

export type Order = typeof orders.$inferSelect;

export const orderItemSchema = z.object({
  productId: z.number().int(),
  slug: z.string(),
  title: z.string(),
  price: z.number().int(),
  quantity: z.number().int().min(1),
  variant: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(11, "Enter a valid 11-digit mobile number")
    .max(14, "Enter a valid mobile number"),
  address: z.string().min(6, "Please enter your full address"),
  city: z.string().min(2, "City is required"),
  area: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionId: z.string().optional(),
  senderNumber: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Order shape after JSON columns are parsed. */
export type OrderView = Omit<Order, "items"> & { items: OrderItem[] };

/**
 * Some variant labels carry a surcharge written into the label itself, e.g.
 * "5 Flavours (+৳600)". Keeping the delta in the label means one source of
 * truth for the storefront, the cart and the server-side re-pricing.
 */
export function variantSurcharge(label?: string | null): number {
  if (!label) return 0;
  const match = label.replace(/,/g, "").match(/\+\s*৳?\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}
