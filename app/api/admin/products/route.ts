import { badRequest, json, readJson, serverError } from "../../_lib/http";
import { createProduct } from "../../_lib/storage";
import { requireAdmin } from "@/lib/api-auth";
import { insertProductSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** POST /api/admin/products */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const parsed = insertProductSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    return json(await createProduct(parsed.data), 201);
  } catch (err) {
    return serverError("admin/products", err);
  }
}
