import { badRequest, fail, json, readJson, serverError } from "../../../_lib/http";
import { deleteProduct, updateProduct } from "../../../_lib/storage";
import { requireAdmin } from "@/lib/api-auth";
import { insertProductSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/products/:id */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return fail("Invalid product id.", 400);

  const parsed = insertProductSchema.partial().safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const updated = await updateProduct(id, parsed.data);
    if (!updated) return fail("Product not found.", 404);
    return json(updated);
  } catch (err) {
    return serverError("admin/products/:id", err);
  }
}

/** DELETE /api/admin/products/:id */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const id = Number(params.id);
  if (!Number.isFinite(id)) return fail("Invalid product id.", 400);

  try {
    if (!(await deleteProduct(id))) return fail("Product not found.", 404);
    return json({ ok: true });
  } catch (err) {
    return serverError("admin/products/:id", err);
  }
}
