import { json } from "../_lib/http";
import { ADMIN_EMAIL, MAIL_ENABLED } from "@/lib/mailer";
import { BRAND } from "@/lib/server-brand";

export const dynamic = "force-dynamic";

/** GET /api/config — store contact details + whether email is live. */
export async function GET() {
  return json({
    brand: BRAND,
    /**
     * false => SMTP credentials are absent, so the site is in preview mode and
     * OTP codes are returned in the API response instead of emailed.
     */
    mailEnabled: MAIL_ENABLED,
    adminEmail: ADMIN_EMAIL,
  });
}
