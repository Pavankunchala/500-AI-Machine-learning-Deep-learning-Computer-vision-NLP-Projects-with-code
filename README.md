# Bharatiya Chakki

Premium stone-ground (chakki) atta and millet flours — a mobile-first Next.js storefront with a warm, artisanal design, working cart/checkout, and a small admin CMS.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Hosting:** Vercel (or any Node host via `npm run build && npm start`)
- **Payments:** Razorpay (UPI, cards, netbanking) with a demo mode when keys are absent, plus COD
- **CMS:** JSON content in `src/data/` plus a password-protected `/admin` that writes overlays to `data/runtime/`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin CMS

1. Visit `/admin/login`
2. Password: `chakki-admin` (or `ADMIN_PASSWORD`)
3. Edit product names, prices, stock, and journal excerpts, then **Save content**

### Payments

Without Razorpay keys, checkout still completes (demo “paid” orders). To charge for real:

1. Create a Razorpay account
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
3. UPI, cards and netbanking appear in the Razorpay modal

### Analytics

Set `NEXT_PUBLIC_GA_ID` and/or `NEXT_PUBLIC_META_PIXEL_ID`. Scripts load only after the visitor accepts analytics cookies.

## Pages

Home, About, Shop + product detail, How it’s made, Journal, Reviews, Contact + store map + FAQ, Cart, Checkout, Order confirmation, Track order, Privacy, Terms, Admin.

## Content you can edit without a deploy (Node host)

- `src/data/products.json` — catalogue
- `src/data/posts.json` — journal
- `src/data/reviews.json` — testimonials
- `src/data/stores.json` — mill / pickup points
- `src/data/site.json` — phone, FSSAI, WhatsApp, copy constants

On Vercel, filesystem writes in `data/runtime/` are ephemeral. Commit JSON edits, or connect a database / headless CMS for production orders.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```
