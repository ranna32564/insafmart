import { fail, json, serverError } from "../../../_lib/http";
import { getOrderByNumber } from "../../../_lib/storage";

export const dynamic = "force-dynamic";

/** GET /api/orders/track/:orderNumber — public tracking, status only. */
export async function GET(
  _req: Request,
  { params }: { params: { orderNumber: string } },
) {
  try {
    const order = await getOrderByNumber(params.orderNumber);
    if (!order) {
      return fail(
        "No order found with that number. Check the spelling and try again.",
        404,
      );
    }
    // Public tracking: status only, no address or contact details.
    return json({
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
    });
  } catch (err) {
    return serverError("orders/track", err);
  }
}
