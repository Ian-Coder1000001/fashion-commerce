# Fashion Commerce — Phase 2

A reusable, premium fashion e-commerce template. Next.js 16 (App Router),
TypeScript, Tailwind v4, MongoDB/Mongoose, Cloudinary, NextAuth v5.

## What's implemented so far

**Phase 1 — Foundation**
- Project scaffold, folder structure, design tokens (Fraunces + Archivo,
  neutral palette)
- MongoDB connection singleton, Cloudinary config
- `media.service.ts` — centralized upload/delete so Cloudinary never gets
  an orphaned asset
- `Product` + `Category` models, `product.service.ts`, `/api/products` routes

**Phase 2 — Admin auth + admin CRUD**
- `User` model (role: customer/admin, hashed password)
- `npm run seed:admin` — creates/promotes the first admin from `.env.local`
- NextAuth v5 with Credentials provider (Google added next)
- `middleware.ts` — `/admin/*` requires an authenticated admin session
- Admin shell: sidebar layout, login page
- Admin **Categories** page: create, list, delete (blocked if products use it)
- Admin **Products** page: create, list, delete — delete goes through the
  Cloudinary-safe service, all via real Server Actions (no fake buttons)

Not yet built: storefront pages, Google login, cart, checkout, payments,
blog/about/contact CMS.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the env template and fill in real values:
   ```
   cp .env.example .env.local
   ```

   - `MONGODB_URI` — a MongoDB Atlas connection string (free tier is fine
     to start)
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
     — from your Cloudinary dashboard (free tier is fine to start)
   - Generate `AUTH_SECRET`:
     ```
     npx auth secret
     ```
     (this writes it straight into `.env.local`)
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (8+ characters) — used only
     by the seed script below
   - Leave Google and payment vars blank for now — used in later phases

3. Create the first admin account:
   ```
   npm run seed:admin
   ```
   Safe to re-run any time — it upserts, never duplicates.

4. Run the dev server:
   ```
   npm run dev
   ```
   Open http://localhost:3000/login and sign in with your admin
   credentials. You'll land in `/admin`.

## Testing what's built so far

1. Sign in at `/login` with your seeded admin account.
2. Go to **Categories**, add one (e.g. name "Shirts", slug "shirts").
3. Go to **Products**, fill out the form, submit — it should appear in
   the table immediately.
4. Click **Delete** on a product — it disappears immediately (any
   attached Cloudinary images would be cleaned up too, once image
   upload is wired in a later pass).
5. Try visiting `/admin` in an incognito window (no session) — you
   should be redirected to `/login`, confirming the middleware works.

You can still hit the API directly if you prefer:
```bash
curl http://localhost:3000/api/products
```

## Note on fonts

`next/font/google` fetches font files from Google at build time. This
requires normal internet access — it will work in your local dev
environment and on Vercel. It will NOT work in network-restricted
sandboxes.

## Next up: Phase 3

Storefront: homepage, navigation, category pages, product detail pages —
the first pages an actual customer will see, replacing the remaining
Next.js starter content.
