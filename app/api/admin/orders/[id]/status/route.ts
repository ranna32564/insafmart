import { z } from "zod";

import { badRequest, fail, json, readJson, serverError } from "../../../../_lib/http";
import { getOrder, updateOrderStatus } from "../../../../_lib/storage";
import { requireAdmin } from "@/lib/api-auth";
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
  sendStatusUpdateEmail,
} from "@/lib/mailer";
import { ORDER_STATUSES } from "@/lib/schema";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  adminNote: z.string().optional().nullable(),
});

/** PATCH /api/admin/orders/:id/status — approve, reject, ship, deliver, cancel. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return fail("Invalid order id.", 400);

  const parsed = statusSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const before = await getOrder(id);
    if (!before) return fail("Order not found.", 404);

    const order = await updateOrderStatus(id, parsed.data.status, parsed.data.adminNote);
    if (!order) return fail("Order not found.", 404);

    // Email the customer about the transition that just happened.
    if (order.status === "confirmed" && before.status !== "confirmed") {
      await sendPaymentApprovedEmail(order.email, order);
    } else if (order.status === "rejected" && before.status !== "rejected") {
      await sendPaymentRejectedEmail(order.email, order, parsed.data.adminNote);
    } else if (before.status !== order.status && ["shipped", "delivered", "cancelled"].includes(order.status)) {
      await sendStatusUpdateEmail(order.email, order);
    }

    return json(order);
  } catch (err) {
    return serverError("admin/orders/status", err);
  }
}
