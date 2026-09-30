# Bagisto React UI (static mock)

A static React copy of the **default Bagisto storefront** from `C:\xampp\htdocs\my-bagisto-store`,
built to show the customer UI to the client and collect changes before building on the real store.
No backend: everything runs on mock data, and cart / wishlist / login state is kept in the browser.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
```

## Stack

Vite + React 19 + React Router 7 + Tailwind CSS 3.
`tailwind.config.js` and `src/index.css` are copied from the Bagisto Shop package, so the class names,
colors (navyBlue, lightOrange, ...), fonts (Poppins, DM Serif Display) and the `bagisto-shop` icon font match.

## Pages (URLs mirror the real store)

| Area | URLs |
|---|---|
| Home | `/` |
| Category / product | `/:slug` (e.g. `/mens`, `/blossom-breeze-cotton-printed-short-skirt`) |
| Search, compare | `/search?query=...`, `/compare` |
| Cart and checkout | `/checkout/cart`, `/checkout/onepage`, `/checkout/onepage/success` |
| Auth | `/customer/login`, `/customer/register`, `/customer/forgot-password`, `/customer/reset-password` |
| Account | `/customer/account` (profile, addresses, orders, downloadable products, reviews, wishlist, GDPR, RMA) |
| Content | `/contact-us`, `/page/:slug` (about-us, privacy-policy, ...), 404 |

## Demo notes

- Any email and a password of 6+ characters signs in (mock customer "John Doe").
- Coupon code `SAVE10` gives 10% off.
- Placing an order adds it to the account's order list.
- To reset the demo, clear the site's local storage (keys start with `bagisto-ui:`).

## Where the data comes from

| File | Source |
|---|---|
| `src/data/products.json`, `categories.json`, `sections.json` | Exported read-only from the store's `bagisto` database |
| `src/data/extras.json` | Downloadable links, booking and bundle options from the installer demo data |
| `src/data/lang.json` | `packages/Webkul/Shop/src/Resources/lang/en/app.php` (all UI text) |
| `src/data/cms-pages.json` | CMS pages from the database |
| `src/data/account.js` | Hand-written mock customer, addresses, orders, payment and shipping methods |
| `public/images/` | Shop theme assets and the installer's sample product, category and banner images |

## Customising for the client

- Colors and fonts: `tailwind.config.js` (`navyBlue` is the primary color).
- Logo: `public/images/logo.svg`.
- Home page sections (banners, carousels, static blocks): `src/data/sections.json`.
- Text: `src/data/lang.json`.
