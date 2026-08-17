# Repute — Premium Beauty E-Commerce

A full-stack, production-architected e-commerce platform for a premium cosmetics and beauty
brand — storefront, customer accounts and a complete no-code admin dashboard, all backed by a
real database.

Built with **Next.js 16** (App Router, Turbopack), **TypeScript**, **Prisma** (SQLite by
default, swappable to PostgreSQL/MySQL), **Auth.js (NextAuth v5)**, **Tailwind CSS v4**, and
**Zustand**.

## What's included

- **Storefront**: Home, Shop (filters + sort), Categories, Search, Product detail (gallery,
  variants, reviews, related products, frequently-bought-together), Cart, Wishlist, multi-step
  Checkout, Order confirmation, Customer account (profile, orders + tracking, addresses,
  wishlist, recently viewed, settings), About, Contact, FAQ, Shipping & Returns, Privacy
  Policy, Terms.
- **Admin dashboard** (`/admin`, separate auth, role-protected): analytics with charts,
  full product/category/brand/inventory CRUD with image upload, order management with status
  tracking, customer management, promo code/discount management, review moderation, and a
  homepage CMS (hero, banners, featured products) — no code changes required to run the store.
- **Realistic seed data**: 6 categories, 11 fictional brands, 48 products with variants
  (shades/sizes), 168 reviews, discount codes, demo orders and a demo admin + customer account.
- Generated, brand-consistent placeholder photography (see [Placeholder imagery](#placeholder-imagery)).

## Requirements

- Node.js 20.9+ (Node 22 recommended)
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Open `.env` and:
- Generate a real secret for `AUTH_SECRET`: `openssl rand -base64 32`
- Set `ADMIN_SEED_PASSWORD` and `CUSTOMER_SEED_PASSWORD` to passwords **you** choose (8+
  characters, and the two must differ). **There is no built-in default password** — the seed
  script refuses to run if these are unset, too short, identical to each other, or still the
  `change-me-before-seeding` placeholder from `.env.example`. This is intentional: it's the
  guardrail that stops a real deployment from ever getting a publicly-known admin password.

Then create the database and load the demo catalog:

```bash
npx prisma migrate dev --name init   # creates dev.db and applies the schema
npm run db:seed                      # populates categories, brands, products, demo orders, etc.
npm run dev
```

Visit **http://localhost:3000**.

### Demo accounts

The seed script creates exactly two accounts you can sign in with, using the email/password
*you* set in `.env`:

| Role     | Email               | Password                    |
|----------|----------------------|-------------------------------|
| Admin    | `ADMIN_SEED_EMAIL`   | whatever you set in `ADMIN_SEED_PASSWORD`  |
| Customer | `CUSTOMER_SEED_EMAIL`| whatever you set in `CUSTOMER_SEED_PASSWORD` |

Admin dashboard: **http://localhost:3000/admin/login**

Re-seeding after editing `.env` recreates these two accounts with whatever email/password are
currently set. The four other demo customers in the seed data (used only to author sample
reviews/orders) each get a random, never-displayed password and are not meant to be signed
into.

If you want the login screens to remind you which env var holds the password (handy while
developing), set `NEXT_PUBLIC_SHOW_DEMO_HINTS="true"` in `.env`. Leave it unset — the default —
anywhere the app might be reachable by someone other than you; it never prints an actual
password, but there's no reason to advertise the account emails either.

## Scripts

```bash
npm run dev        # start the dev server (Turbopack)
npm run build      # production build (also type-checks the whole app)
npm run start      # run the production build
npm run lint       # ESLint
npm run db:seed    # reset & repopulate the database with demo data
npx prisma studio  # browse/edit the database visually
```

## Architecture

```
src/
  app/
    (storefront)/    # all customer-facing routes, share the storefront header/footer/cart drawer
    admin/            # admin dashboard — separate layout, separate auth guard
      (dashboard)/    # everything behind the admin sidebar
      login/          # admin sign-in (outside the sidebar layout)
    api/              # file upload + NextAuth route handlers
  components/
    ui/               # design-system primitives (Button, Input, Sheet, Modal, Tabs, ...)
    layout/, cart/, product/, shop/, checkout/, account/, admin/, home/, search/
  lib/
    data/             # read-only Prisma queries, organized by domain
    actions/          # "use server" mutations (cart/checkout/reviews/admin CRUD/...)
    auth.ts           # Auth.js configuration
    validations.ts    # zod schemas shared by client forms and server actions
  store/              # Zustand client state (cart, wishlist hydration, recently viewed, search)
  generated/prisma/   # generated Prisma client (git-ignored, regenerated on install)
prisma/
  schema.prisma       # full data model
  seed.ts             # demo data
```

**Data flow**: nothing is hardcoded. Products, categories, brands, orders, customers, reviews,
discounts and homepage content all live in the database and are read via `src/lib/data/*`.
Every admin mutation goes through a server action in `src/lib/actions/*`, which calls
`requireAdmin()` before touching the database — publishing a product, changing a price, or
updating an order status shows up on the storefront immediately (no rebuild/redeploy needed).

**Auth**: a single `User` table with a `role` column (`CUSTOMER` | `ADMIN`) and a
`status` column (`ACTIVE` | `DISABLED`) backs both customer and admin sign-in via
Auth.js Credentials + bcrypt password hashing. `src/proxy.ts` (Next 16's middleware) blocks
`/account/*` for anyone unauthenticated and `/admin/*` for anyone who isn't an `ADMIN`,
redirecting to the appropriate sign-in page. Admin credentials/secrets are never exposed to the
client — all checks happen server-side.

**Cart**: kept client-side (Zustand + localStorage) for a fast, offline-friendly shopping
experience that works for guests; at checkout the cart contents are re-validated against the
database (current price, stock, product availability) before an order is created, so nothing
about pricing is ever trusted from the client. Wishlist and recently-viewed are account-backed
(persist across devices) for signed-in users.

**Checkout / payments**: the checkout flow collects customer info, shipping address, delivery
method and payment method (Cash on Delivery, Bank Transfer, or Card), and creates a real `Order`
+ `OrderItem` record with inventory deduction, all in a single DB transaction. **No payment
processing is implemented** — selecting "Card" simply notes that a payment provider isn't wired
up yet. To go live, add your provider's SDK (e.g. Stripe) inside the payment step in
`src/components/checkout/checkout-flow.tsx` and the `placeOrder` action in
`src/lib/actions/orders.ts`, gated behind `paymentStatus`.

## Switching to PostgreSQL / MySQL for production

The app ships on SQLite so it runs with zero external services. To move to Postgres:

1. In `prisma/schema.prisma`, change the datasource `provider` to `"postgresql"`.
2. Install the driver adapter: `npm install @prisma/adapter-pg pg`.
3. In `src/lib/db.ts` and `prisma/seed.ts`, swap `PrismaBetterSqlite3` for `PrismaPg` from
   `@prisma/adapter-pg` (same constructor shape — pass `{ connectionString: process.env.DATABASE_URL }`).
4. Set `DATABASE_URL` to your Postgres connection string.
5. Run `npx prisma migrate dev`.

## Image uploads

Admin-uploaded images (product photos, category/brand images, banners) are written to
`public/uploads/` via `/api/admin/upload` (admin-only) and `/api/upload` (signed-in customers,
used for review photos). For a multi-instance/production deployment, swap these routes to
upload to S3/Cloudinary/R2 instead of local disk — the API surface (accepts `FormData`, returns
`{ url }`) is designed to make that a drop-in change.

## Placeholder imagery

This build ships with **generated, non-photographic placeholder imagery** (soft-gradient
studio backdrops with minimalist bottle/jar/tube silhouettes, produced programmatically by
`scripts/generate-images.ts`) instead of real product photography, since no licensed photo
assets were available. It's intentionally styled to match the brand's editorial aesthetic
rather than look like a generic placeholder. Swap in real photography by uploading through the
admin Products page — new images replace these immediately, per-product.

## Testing notes

The full flows below were manually verified against a production build (`npm run build && npm
run start`):

- **Customer journey**: Homepage → Shop → Product → Add to Cart → Cart → Checkout (all 5 steps)
  → Order confirmation, with the order appearing in the customer's Account → Orders.
- **Admin journey**: Admin login → Dashboard → Add Product (with images, pricing, stock) →
  Publish → product appears on the storefront immediately → Edit product / change price → price
  updates live → Delete product → removed from storefront.
- Registration/login/logout, duplicate-email and wrong-password handling.
- Shop/category filtering, sorting, variant selection, search (including empty-result states).
- Checkout field validation (invalid email, missing address fields block advancing), inventory
  deduction on order placement, and promo code redemption.
- Admin auth boundaries: unauthenticated and customer-role sessions cannot reach any `/admin/*`
  route (enforced both by `src/proxy.ts` and by `requireAdmin()` in every admin server action).
- Admin product CRUD with image upload, live inventory editing, order status/tracking updates,
  discount code management, review moderation, and homepage CMS — all verified to publish
  instantly to the storefront with no rebuild.
- Production build (`npm run build`) passes with no TypeScript errors; `npm run lint` is clean.
