import { badRequest, fail, json, readJson, serverError } from "../_lib/http";
import { generateOrderNumber } from "../_lib/order-number";
import {
  createOrder,
  decrementStock,
  getProduct,
  type NewOrder,
} from "../_lib/storage";
import { upsertUser } from "@/lib/api-auth";
import { sendAdminNewOrderEmail, sendOrderReceivedEmail } from "@/lib/mailer";
import { calcShipping } from "@/lib/server-brand";
import {
  createOrderSchema,
  variantSurcharge,
  type OrderItem,
  type OrderStatus,
} from "@/lib/schema";

export const dynamic = "force-dynamic";

/** POST /api/orders — checkout. Every line is re-priced from the database. */
export async function POST(req: Request) {
  const parsed = createOrderSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  const input = parsed.data;

  // An advance payment must arrive with a transaction ID.
  if (input.paymentMethod !== "cod") {
    const txn = (input.transactionId || "").trim();
    if (txn.length < 6) {
      return fail(
        "Enter the transaction ID from your bKash or Nagad confirmation SMS (at least 6 characters).",
        400,
      );
    }
  }

  try {
    // Price every line from the database — never trust client-sent prices.
    const priced: OrderItem[] = [];
    for (const item of input.items) {
      const product = await getProduct(item.productId);
      if (!product) {
        return fail(`"${item.title}" is no longer available.`, 400);
      }
      if (product.stock < item.quantity) {
        return fail(
          product.stock === 0
            ? `"${product.title}" has just gone out of stock.`
            : `Only ${product.stock} left of "${product.title}". Please reduce the quantity.`,
          400,
        );
      }
      priced.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price + variantSurcharge(item.variant ?? null),
        quantity: item.quantity,
        variant: item.variant ?? null,
        image: product.images[0] ?? null,
      });
    }

    const subtotal = priced.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = calcShipping(subtotal, input.city);
    const total = subtotal + shipping;

    const status: OrderStatus =
      input.paymentMethod === "cod" ? "pending" : "pending_verification";

    // Keep a customer record so the order shows up in My Account after sign-in.
    const account = await upsertUser(input.email, input.customerName, input.phone);

    const payload: NewOrder = {
      orderNumber: await generateOrderNumber(),
      userId: account.id,
      customerName: input.customerName,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      address: input.address,
      city: input.city,
      area: input.area ?? null,
      notes: input.notes ?? null,
      paymentMethod: input.paymentMethod,
      transactionId: input.paymentMethod === "cod" ? null : input.transactionId!.trim(),
      senderNumber: input.senderNumber?.trim() || null,
      subtotal,
      shipping,
      total,
      status,
      items: priced,
      adminNote: null,
      createdAt: new Date().toISOString(),
      verifiedAt: null,
    };

    const order = await createOrder(payload);

    await decrementStock(priced);

    // Notify the customer and the admin. Failures are logged, never fatal —
    // a mail outage must not lose an order. Awaited (unlike the Express build)
    // because a serverless function can be frozen the moment it responds.
    await Promise.allSettled([
      sendOrderReceivedEmail(order.email, order),
      sendAdminNewOrderEmail(order),
    ]);

    return json(order, 201);
  } catch (err) {
    return serverError("orders", err);
  }
}
