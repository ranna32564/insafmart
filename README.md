# Insaf Mart — Next.js + Supabase

Premium, minimal e-commerce storefront for Insaf Mart (Dhaka): attar and fragrance,
skincare, hair care, fashion and gift boxes — with manual bKash/Nagad payment
verification, cash on delivery, email-OTP accounts and a full admin panel.

Ivory / charcoal / deep-maroon art direction, Instrument Serif display type over
Switzer body type, mobile-first and tested down to 390px.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix) |
| Data | Supabase (Postgres), accessed only from server route handlers with the service-role key |
| Email | Nodemailer over Gmail SMTP (App Password) or any SMTP host |
| Data fetching | TanStack Query against `/api/*` route handlers |
| Deploy | Vercel or Netlify (free tier) |

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### 1. Create the database

In the Supabase dashboard → **SQL Editor**, run in this order:

1. `supabase/schema.sql` — creates the 7 tables, indexes and enables RLS
   (no public policies: every query runs server-side with the service-role key)
2. `supabase/seed.sql` — inserts the 5 categories and all 52 catalog items
   (3 gift combo boxes + 49 products). Idempotent on product slug.

To regenerate the seed after editing the catalog: `python3 scripts/generate-seed.py`.

### 2. Add environment variables

See `.env.example` for the full annotated list. The required ones:

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (server-side only, never exposed) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `/admin` login; the account is created on first login |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Gmail address + 16-digit **App Password** |

**Getting a Gmail App Password:** Google Account → Security → turn on 2-Step
Verification → App passwords → generate one for "Mail". Paste the 16 characters
(no spaces) into `EMAIL_APP_PASSWORD`.

### 3. Preview mode (no email credentials)

Leave `EMAIL_USER` and `EMAIL_APP_PASSWORD` empty and the app still works
end-to-end: every email is logged to the server console and kept in an in-memory
outbox you can read in the admin panel's **Email** tab, and
`POST /api/auth/request-otp` returns the code so the sign-in screen can display it.
Set both variables to send real mail.

## Store details

| | |
| --- | --- |
| bKash (Personal / Send Money) | **01736909636** |
| Nagad | **01737131591** |
| WhatsApp — orders | **01601600289** |
| WhatsApp — support | **01601772897** |
| Email | **admininsafmart@gmail.com** |
| Delivery | ৳120 inside Dhaka · ৳140 outside · free over ৳3,000 |

## Payment flow (manual verification)

1. At checkout the customer picks **Cash on Delivery** or **Pay in advance**.
2. Paying in advance, they choose **bKash** or **Nagad**, send the exact total to the
   number shown, then enter their **Transaction ID** and sending number.
3. The order is created with status **Pending Verification**; the customer gets a
   confirmation email and the admin gets a new-order alert at `admininsafmart@gmail.com`.
4. The admin opens `/admin` → **Orders**, checks the wallet, and clicks
   **Approve payment** → status becomes **Confirmed**, the invoice appears in the
   customer's account, and a payment-confirmed email with the invoice goes out.
   **Reject** moves it to Rejected with an optional note, also emailed.
5. From Confirmed the pipeline continues **Shipped → Delivered**, each step emailed.

Cash-on-delivery orders skip verification and land in **Pending**.

Prices, variant surcharges, shipping and totals are always recomputed on the server
from the database — client-submitted amounts are ignored.

## Accounts (email OTP)

Customers sign in at `/signin` with an email address; a 6-digit OTP is mailed
(valid 10 minutes, 5 requests per 10 minutes per address). Verifying issues a bearer
token stored in the browser and used by every authenticated request. `/account` shows
order history, invoices and an editable profile.

## Admin panel

`/admin`, protected by email + password:

- **Dashboard** — total orders, pending verification, revenue, product count
- **Orders** — every order with transaction ID, approve/reject, full status pipeline, notes
- **Products** — create, edit and delete: title, category, price, stock, images, tags, variants
- **Customers** — customer list with order history
- **Email** — the preview-mode outbox

## Project structure

```
app/
  layout.tsx, providers.tsx      # fonts, metadata, provider stack, chrome
  page.tsx                       # home
  shop/  product/[slug]/  cart/  checkout/
  signin/  account/  about/  contact/  admin/
  not-found.tsx
  api/                           # 21 route handlers (see below)
    _lib/                        # storage, http helpers, order numbers
components/
  header, footer, cart-drawer, product-card, support-chat,
  whatsapp-button, site-layout, status-badge, logo, reveal, ...
  ui/                            # shadcn primitives
lib/
  schema.ts                      # shared types + zod validators + variantSurcharge
  supabase.ts  api-auth.ts  mailer.ts  server-brand.ts   # server only
  cart.tsx  auth.tsx  query-client.ts  use-store.ts  brand.ts  safe-storage.ts
supabase/
  schema.sql  seed.sql
scripts/
  generate-seed.py  catalog.json
public/
  images/  favicon.svg
```

## API reference

Public — `GET /api/config`, `GET /api/products`, `GET /api/products/[slug]`,
`GET /api/shipping-quote`, `GET /api/orders/track/[orderNumber]`

Auth — `POST /api/auth/request-otp`, `POST /api/auth/verify-otp`,
`POST /api/auth/admin-login`, `GET /api/auth/me`, `PATCH /api/auth/profile`,
`POST /api/auth/logout`

Orders — `POST /api/orders`, `GET /api/orders/mine`

Admin (bearer token, admin only) — `GET /api/admin/stats`, `GET /api/admin/orders`,
`PATCH /api/admin/orders/[id]/status`, `GET /api/admin/customers`,
`GET /api/admin/outbox`, `POST /api/admin/products`,
`PATCH|DELETE /api/admin/products/[id]`

Authenticated requests send `Authorization: Bearer <token>`.

## Deploying

**Vercel** — import the repo, add the environment variables from `.env.example`,
deploy. No extra configuration needed.

**Netlify** — install the official Next.js runtime (auto-detected), set build command
`npm run build`, add the same environment variables.

Run `supabase/schema.sql` and `supabase/seed.sql` against your Supabase project before
the first deploy.

## Notes

- The OTP rate limiter and the preview-mode outbox live in memory, so on serverless
  platforms they are per-instance. Move them to a table if you need them shared.
- Product images ship as WebP in `public/images`; `next/image` optimization is disabled
  so the same files work on any host.
- Never commit `.env.local`. Rotate the Supabase service-role key and Gmail App
  Password if they are ever exposed.
