import nodemailer, { type Transporter } from "nodemailer";
import type { OrderView } from "@/lib/schema";
import { BRAND } from "@/lib/server-brand";

/**
 * Email is sent with Nodemailer over Gmail SMTP using an App Password.
 *
 *   EMAIL_USER=admininsafmart@gmail.com
 *   EMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   # 16-char Gmail App Password
 *
 * If those are absent the transport is not created and every send is written to
 * the console plus an in-memory outbox instead. That keeps the whole site — OTP
 * signup, invoices, admin alerts — usable in a demo or preview environment
 * without credentials, and makes it obvious what would have been delivered.
 */

const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_APP_PASSWORD = (process.env.EMAIL_APP_PASSWORD || "").replace(/\s/g, "");
export const MAIL_ENABLED = Boolean(EMAIL_USER && EMAIL_APP_PASSWORD);

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || BRAND.email;

/**
 * Created on first send rather than at module load: route handlers are bundled
 * per-request on serverless, and a lazy transport keeps `next build` free of
 * any SMTP work.
 */
let transporter: Transporter | null = null;
let announced = false;

function getTransporter(): Transporter | null {
  if (!MAIL_ENABLED) {
    if (!announced) {
      announced = true;
      console.log(
        "[mail] EMAIL_USER / EMAIL_APP_PASSWORD not set — running in preview mode. " +
          "Emails will be logged to the console instead of sent.",
      );
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE ?? "true") === "true",
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
    });
    console.log(`[mail] SMTP transport ready as ${EMAIL_USER}`);
  }
  return transporter;
}

export type OutboxEntry = {
  to: string;
  subject: string;
  sentAt: string;
  delivered: boolean;
  preview: string;
};

/**
 * Last 50 messages, newest first. Surfaced in the admin panel via
 * `GET /api/admin/outbox`. In-memory, so on serverless it only holds what the
 * current lambda instance sent — same as the reference, which lost it on
 * restart.
 */
export const outbox: OutboxEntry[] = [];

async function send(to: string, subject: string, html: string, text: string, orderAttachment?: { filename: string; content: Buffer }) {
  const entry: OutboxEntry = {
    to,
    subject,
    sentAt: new Date().toISOString(),
    delivered: false,
    preview: text.slice(0, 400),
  };

  const mail = getTransporter();

  if (!mail) {
    console.log(`\n[mail:preview] To: ${to}\n[mail:preview] Subject: ${subject}\n${text}\n`);
    outbox.unshift(entry);
    outbox.length = Math.min(outbox.length, 50);
    return { delivered: false as const };
  }

  try {
    await mail.sendMail({
      from: `"${BRAND.name}" <${EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
      attachments: orderAttachment ? [orderAttachment] : undefined,
    });
    entry.delivered = true;
    console.log(`[mail] sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[mail] FAILED to send "${subject}" to ${to}:`, err);
  }

  outbox.unshift(entry);
  outbox.length = Math.min(outbox.length, 50);
  return { delivered: entry.delivered };
}

/* -------------------------------------------------------------------------- */
/* Shared HTML shell                                                          */
/* -------------------------------------------------------------------------- */

const IVORY = "#FBF9F5";
const CHARCOAL = "#1C1A17";
const MAROON = "#6E1A2B";
const MUTED = "#6B6760";
const BORDER = "#E4DFD7";

function shell(heading: string, body: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${IVORY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${CHARCOAL};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFDFA;border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
        <tr><td style="background:${CHARCOAL};padding:22px 28px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.02em;color:${IVORY};">Insaf&nbsp;Mart</div>
          <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#A8A29A;margin-top:5px;">Attar &middot; Beauty &middot; Gifts</div>
        </td></tr>
        <tr><td style="padding:30px 28px 8px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:400;color:${CHARCOAL};">${heading}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:22px 28px 26px;border-top:1px solid ${BORDER};">
          <p style="margin:0 0 6px;font-size:12px;color:${MUTED};line-height:1.7;">
            Questions? WhatsApp <strong style="color:${CHARCOAL};">${BRAND.whatsapp[0]}</strong>
            or <strong style="color:${CHARCOAL};">${BRAND.whatsapp[1]}</strong><br/>
            Email <a href="mailto:${BRAND.email}" style="color:${MAROON};">${BRAND.email}</a>
          </p>
          <p style="margin:10px 0 0;font-size:11px;color:#9C968D;">You are receiving this because you placed an order or created an account at Insaf Mart.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const taka = (n: number) => `৳${n.toLocaleString("en-BD")}`;

/* -------------------------------------------------------------------------- */
/* 1. OTP verification code                                                   */
/* -------------------------------------------------------------------------- */

export function sendOtpEmail(to: string, code: string) {
  const html = shell(
    "Verify your email",
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:${MUTED};">
       Enter this 6-digit code on the Insaf Mart sign-in screen to activate your account.
     </p>
     <div style="margin:0 0 18px;padding:18px;text-align:center;background:${IVORY};border:1px solid ${BORDER};border-radius:4px;">
       <span style="font-size:32px;letter-spacing:0.32em;font-weight:700;color:${MAROON};">${code}</span>
     </div>
     <p style="margin:0;font-size:13px;line-height:1.7;color:${MUTED};">
       The code expires in 10 minutes. If you did not request it, you can safely ignore this email.
     </p>`,
  );

  return send(
    to,
    `${code} is your Insaf Mart verification code`,
    html,
    `Your Insaf Mart verification code is ${code}. It expires in 10 minutes.`,
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Order received (to customer)                                            */
/* -------------------------------------------------------------------------- */

function itemRows(order: OrderView) {
  return order.items
    .map(
      (i) => `<tr>
        <td style="padding:9px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${CHARCOAL};">
          ${i.title}${i.variant ? `<span style="color:${MUTED};"> — ${i.variant}</span>` : ""}
          <span style="color:${MUTED};"> × ${i.quantity}</span>
        </td>
        <td align="right" style="padding:9px 0;border-bottom:1px solid ${BORDER};font-size:13px;white-space:nowrap;color:${CHARCOAL};">
          ${taka(i.price * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");
}

function totalsBlock(order: OrderView) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
    <tr><td style="padding:5px 0;font-size:13px;color:${MUTED};">Subtotal</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:${CHARCOAL};">${taka(order.subtotal)}</td></tr>
    <tr><td style="padding:5px 0;font-size:13px;color:${MUTED};">Delivery</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:${CHARCOAL};">${order.shipping === 0 ? "Free" : taka(order.shipping)}</td></tr>
    <tr><td style="padding:11px 0 0;border-top:1px solid ${BORDER};font-size:14px;font-weight:700;color:${CHARCOAL};">Total</td>
        <td align="right" style="padding:11px 0 0;border-top:1px solid ${BORDER};font-size:16px;font-weight:700;color:${MAROON};">${taka(order.total)}</td></tr>
  </table>`;
}

const methodLabel = (m: string) =>
  m === "cod" ? "Cash on Delivery" : m === "bkash" ? "bKash (advance)" : "Nagad (advance)";

/** Small dependency-free invoice PDF used as a Nodemailer attachment. */
function invoicePdf(order: OrderView): Buffer {
  const safe = (value: string) => value.replace(/[^\x20-\x7E]/g, "?").replace(/[()\\]/g, "\\$&");
  const lines = [
    "INSAF MART",
    `Invoice: ${order.orderNumber}`,
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.email}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}${order.area ? `, ${order.area}` : ""}, ${order.city}`,
    `Payment: ${methodLabel(order.paymentMethod)}`,
    "",
    ...order.items.map((i) => `${i.title}${i.variant ? ` - ${i.variant}` : ""} x ${i.quantity} = BDT ${i.price * i.quantity}`),
    "",
    `Subtotal: BDT ${order.subtotal}`,
    `Delivery: BDT ${order.shipping}`,
    `Total: BDT ${order.total}`,
    `Status: ${order.status}`,
  ];
  const content = ["BT", "/F1 10 Tf", "50 760 Td", ...lines.flatMap((line, i) => [i ? "0 -16 Td" : "", `(${safe(line)}) Tj`]), "ET"].filter(Boolean).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\\nstream\\n${content}\\nendstream`,
  ];
  let pdf = "%PDF-1.4\\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\\n${objects[i]}\\nendobj\\n`;
  }
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \\n`;
  pdf += `trailer\\n<< /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xref}\\n%%EOF`;
  return Buffer.from(pdf.replace(/\\n/g, "\n"), "utf8");
}

export function sendOrderReceivedEmail(to: string, order: OrderView) {
  const awaiting = order.status === "pending_verification";

  const html = shell(
    "We have your order",
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:${MUTED};">
       Thank you, ${order.customerName}. Order
       <strong style="color:${CHARCOAL};">${order.orderNumber}</strong> has been received.
     </p>
     ${
       awaiting
         ? `<div style="margin:0 0 20px;padding:14px 16px;background:#FDF6E9;border:1px solid #E8D9B4;border-radius:4px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#6B5526;">
                <strong>Awaiting payment verification.</strong> We are checking transaction ID
                <strong>${order.transactionId}</strong> against our ${order.paymentMethod === "bkash" ? "bKash" : "Nagad"} account.
                You will get a confirmation with your invoice as soon as it clears — usually within a few hours.
              </p>
            </div>`
         : `<div style="margin:0 0 20px;padding:14px 16px;background:#F1F5EE;border:1px solid #D2DFC9;border-radius:4px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#3D5230;">
                <strong>Cash on Delivery.</strong> Please keep ${taka(order.total)} ready for the delivery rider.
              </p>
            </div>`
     }
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(order)}</table>
     ${totalsBlock(order)}
     <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:${MUTED};">
       <strong style="color:${CHARCOAL};">Delivering to</strong><br/>
       ${order.customerName}<br/>${order.address}${order.area ? `, ${order.area}` : ""}<br/>${order.city}<br/>${order.phone}
     </p>`,
  );

  return send(
    to,
    `Order ${order.orderNumber} received — Insaf Mart`,
    html,
    `Order ${order.orderNumber} received. Total ${taka(order.total)}. Payment: ${methodLabel(order.paymentMethod)}.`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Payment approved + invoice (to customer)                                */
/* -------------------------------------------------------------------------- */

export function sendPaymentApprovedEmail(to: string, order: OrderView) {
  const html = shell(
    "Payment confirmed — here is your invoice",
    `<div style="margin:0 0 20px;padding:14px 16px;background:#F1F5EE;border:1px solid #D2DFC9;border-radius:4px;">
       <p style="margin:0;font-size:13px;line-height:1.7;color:#3D5230;">
         <strong>Payment received and verified.</strong>
         ${order.transactionId ? `Transaction <strong>${order.transactionId}</strong> has been matched to our ${order.paymentMethod === "bkash" ? "bKash" : "Nagad"} account.` : ""}
         Your order is now confirmed and being packed.
       </p>
     </div>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
       <tr>
         <td style="font-size:12px;color:${MUTED};line-height:1.8;">
           <strong style="color:${CHARCOAL};">Invoice</strong> ${order.orderNumber}<br/>
           <strong style="color:${CHARCOAL};">Date</strong> ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}<br/>
           <strong style="color:${CHARCOAL};">Payment</strong> ${methodLabel(order.paymentMethod)}
         </td>
       </tr>
     </table>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">${itemRows(order)}</table>
     ${totalsBlock(order)}
     <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:${MUTED};">
       A copy of this invoice is saved in your account under
       <strong style="color:${CHARCOAL};">My Account → Orders</strong>.
       We will message you on WhatsApp when the parcel is handed to the courier.
     </p>`,
  );

  return send(
    to,
    `Payment confirmed — invoice for ${order.orderNumber}`,
    html,
    `Payment confirmed for order ${order.orderNumber}. Total ${taka(order.total)}. Your invoice is attached as a PDF.`,
    { filename: `Insaf-Mart-Invoice-${order.orderNumber}.pdf`, content: invoicePdf(order) },
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Payment rejected (to customer)                                          */
/* -------------------------------------------------------------------------- */

export function sendPaymentRejectedEmail(to: string, order: OrderView, reason?: string | null) {
  const html = shell(
    "We could not verify your payment",
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:${MUTED};">
       We checked our ${order.paymentMethod === "bkash" ? "bKash" : "Nagad"} account for transaction
       <strong style="color:${CHARCOAL};">${order.transactionId || "—"}</strong> against order
       <strong style="color:${CHARCOAL};">${order.orderNumber}</strong> and could not find a matching payment of ${taka(order.total)}.
     </p>
     ${reason ? `<div style="margin:0 0 18px;padding:14px 16px;background:#FBF0F0;border:1px solid #E8C9C9;border-radius:4px;"><p style="margin:0;font-size:13px;line-height:1.7;color:#7A2C2C;">${reason}</p></div>` : ""}
     <p style="margin:0;font-size:13px;line-height:1.7;color:${MUTED};">
       Nothing has been charged and your order is on hold rather than cancelled. Reply to this email or
       WhatsApp us at <strong style="color:${CHARCOAL};">${BRAND.whatsapp[0]}</strong> with a screenshot of the
       payment and we will sort it out the same day.
     </p>`,
  );

  return send(
    to,
    `Action needed — payment not verified for ${order.orderNumber}`,
    html,
    `We could not verify the payment for order ${order.orderNumber}. Please contact us on WhatsApp ${BRAND.whatsapp[0]}.`,
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Status update (to customer)                                             */
/* -------------------------------------------------------------------------- */

const STATUS_COPY: Record<string, { heading: string; body: string }> = {
  shipped: {
    heading: "Your order is on the way",
    body: "Your parcel has been handed to the courier. Most Dhaka deliveries arrive within 24–48 hours; outside Dhaka usually takes 2–4 days.",
  },
  delivered: {
    heading: "Delivered — thank you",
    body: "Your order has been marked delivered. If anything arrived damaged or is missing, message us within 48 hours and we will make it right.",
  },
  cancelled: {
    heading: "Your order has been cancelled",
    body: "This order has been cancelled. If this was not expected, reply to this email and we will look into it.",
  },
};

export function sendStatusUpdateEmail(to: string, order: OrderView) {
  const copy = STATUS_COPY[order.status];
  if (!copy) return Promise.resolve({ delivered: false as const });
  const extra = order.status === "shipped" && order.adminNote
    ? `<div style="margin:0 0 18px;padding:14px 16px;background:${IVORY};border:1px solid ${BORDER};border-radius:4px;"><strong style="color:${CHARCOAL};">Tracking / delivery note:</strong> ${order.adminNote}</div>`
    : order.status === "cancelled" && order.adminNote
      ? `<div style="margin:0 0 18px;padding:14px 16px;background:#FBF0F0;border:1px solid #E8C9C9;border-radius:4px;"><strong style="color:${CHARCOAL};">Reason / refund note:</strong> ${order.adminNote}</div>`
      : order.status === "delivered"
        ? `<p style="margin:18px 0;font-size:13px;line-height:1.7;color:${MUTED};"><strong style="color:${CHARCOAL};">How did we do?</strong> Reply to this email or WhatsApp us with your feedback.</p>`
        : "";
  const html = shell(
    copy.heading,
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:${MUTED};">Order <strong style="color:${CHARCOAL};">${order.orderNumber}</strong> — ${copy.body}</p>${extra}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(order)}</table>${totalsBlock(order)}`,
  );

  return send(
    to,
    `${copy.heading} — ${order.orderNumber}`,
    html,
    `${copy.heading}. Order ${order.orderNumber}. ${copy.body}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 6. New order alert (to admin)                                              */
/* -------------------------------------------------------------------------- */

export function sendAdminNewOrderEmail(order: OrderView) {
  const needsAction = order.status === "pending_verification";

  const html = shell(
    needsAction ? "New order — payment needs verification" : "New order — Cash on Delivery",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
       <tr><td style="font-size:13px;line-height:1.9;color:${CHARCOAL};">
         <strong>Order</strong> ${order.orderNumber}<br/>
         <strong>Placed</strong> ${new Date(order.createdAt).toLocaleString("en-GB")}<br/>
         <strong>Total</strong> <span style="color:${MAROON};font-weight:700;">${taka(order.total)}</span><br/>
         <strong>Payment</strong> ${methodLabel(order.paymentMethod)}
         ${order.transactionId ? `<br/><strong>Transaction ID</strong> <span style="font-family:monospace;background:${IVORY};padding:2px 6px;border:1px solid ${BORDER};">${order.transactionId}</span>` : ""}
         ${order.senderNumber ? `<br/><strong>Sent from</strong> ${order.senderNumber}` : ""}
       </td></tr>
     </table>
     ${
       needsAction
         ? `<div style="margin:0 0 18px;padding:14px 16px;background:#FDF6E9;border:1px solid #E8D9B4;border-radius:4px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#6B5526;">
                Check your ${order.paymentMethod === "bkash" ? "bKash" : "Nagad"} statement for
                <strong>${taka(order.total)}</strong> with transaction ID <strong>${order.transactionId}</strong>,
                then approve or reject it in the admin panel under <strong>Orders</strong>.
              </p>
            </div>`
         : ""
     }
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(order)}</table>
     ${totalsBlock(order)}
     <p style="margin:20px 0 0;font-size:13px;line-height:1.8;color:${MUTED};">
       <strong style="color:${CHARCOAL};">Customer</strong><br/>
       ${order.customerName}<br/>
       ${order.email}<br/>
       ${order.phone}<br/>
       ${order.address}${order.area ? `, ${order.area}` : ""}, ${order.city}
       ${order.notes ? `<br/><em>Note: ${order.notes}</em>` : ""}
     </p>`,
  );

  return send(
    ADMIN_EMAIL,
    `${needsAction ? "[VERIFY] " : ""}New order ${order.orderNumber} — ${taka(order.total)}`,
    html,
    `New order ${order.orderNumber} for ${taka(order.total)} via ${methodLabel(order.paymentMethod)}. ${order.transactionId ? `Transaction ID: ${order.transactionId}.` : ""} Customer: ${order.customerName}, ${order.phone}.`,
  );
}
