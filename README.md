# Bagisto React UI (static mock): Sainmarks custom print store

A static React copy of the **default Bagisto storefront** from `C:\xampp\htdocs\my-bagisto-store`,
re-skinned for **Sainmarks**, a custom printing company (T-shirts, pens, diaries) to get the design confirmed by the client
before building on the real store. No backend: everything runs on mock data, and cart / wishlist / login
state is kept in the browser.

Rule for every change: it must be something the real Bagisto store can do (admin config, catalog data,
or the product designer that is already built into `C:\xampp\htdocs\bagisto`).

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
The product designer uses fabric.js 5, qrcode and lucide-react (same as `custom-print-shirt`), loaded only on its page.

## Pages (URLs mirror the real store)

| Area | URLs |
|---|---|
| Home | `/` |
| Category / product | `/:slug` (e.g. `/custom-t-shirts`, `/customizable-cotton-t-shirt`) |
| Product designer | `/customize/:productId` (Bagisto: `customize-tshirt/{id}`) |
| Search, compare | `/search?query=...`, `/compare` |
| Cart and checkout | `/checkout/cart`, `/checkout/onepage`, `/checkout/onepage/success` |
| Auth | `/customer/login`, `/customer/register`, `/customer/forgot-password`, `/customer/reset-password` |
| Account | `/customer/account` (profile, addresses, orders, downloadable products, reviews, wishlist, GDPR, RMA) |
| Content | `/contact-us`, `/page/:slug` (about-us, privacy-policy, ...), 404 |

## Catalog

Categories: Custom T-Shirts (Round Neck, Polo, Oversized), Hoodies & Sweatshirts, Custom Pens,
Diaries & Notebooks, Corporate Gift Sets. 18 products in `src/data/products.json`:

- `is_customizable: true` + `customizer: 'tshirt' | 'pen' | 'diary'` shows the **Customize This ...** button
  (Bagisto: the `is_customizable` attribute; `customizer` is the one extra attribute the real store needs).
- `customizable_options` are Bagisto's native customizable options for simple products (Size, Ink Colour,
  Inside Pages), with optional extra price.
- Hoodies and the graphic tee are configurable (Color x Size); gift sets are bundles (`src/data/extras.json`).

## Product designer (`src/designer/`)

Port of `C:\xampp\htdocs\custom-print-shirt` (React + fabric.js), made config driven so the same designer
serves T-shirts, pens and diaries. Flow, same as the Bagisto store:

1. Product page: pick options, click **Customize This T-Shirt / Pen / Diary**.
2. Designer: text, paragraph, logo / image upload, shapes, QR code, layers, align, zoom, product colour.
3. **Save design & Proceed**: each surface is rendered as a composite image (mockup + colour + design),
   added to the cart as a customized line (`customized_preview`, `customized_images`, `shirt_color`),
   then shown in mini cart, cart, checkout and the customer order view ("Customized Views (All Sides)").

| Type | Surfaces | Mockups (`public/designer/`) |
|---|---|---|
| T-shirt | Front, Back, Right Sleeve, Left Sleeve | `tshirt-*.png` (from custom-print-shirt) |
| Diary | Front Cover, Back Cover | `diary-front.png`, `diary-back.png` |
| Pen | Barrel | `pen-barrel.png` |

Surfaces, print areas and size labels live in `src/designer/constants/surfaceConfig.ts`. All mockups share
one 1600x2000 frame, so a print area is defined once on the image and mapped to the screen automatically.

## Demo notes

- Any email and a password of 6+ characters signs in (mock customer "John Doe").
- Coupon code `SAVE10` gives 10% off.
- Placing an order adds it to the account's order list.
- To reset the demo, clear the site's local storage (keys start with `print-shop-ui:`).

## Where the data comes from

| File | Source |
|---|---|
| `src/data/products.json`, `categories.json` | Hand-written print-shop catalog (Bagisto product / category fields) |
| `src/data/sections.json` | Bagisto theme customizations (carousel, static content, product carousels, services, footer) |
| `src/data/extras.json` | Bundle options of the gift sets |
| `src/data/lang.json` | `packages/Webkul/Shop/src/Resources/lang/en/app.php` (all UI text) |
| `src/data/cms-pages.json` | CMS pages from the database |
| `src/data/account.js` | Hand-written mock customer, addresses, orders, payment and shipping methods |
| `public/images/products`, `sliders`, `static`, `categories` | Photos from Pexels (free for commercial use, pexels.com/license), cropped to Bagisto sizes |
| `public/images/logo.png`, `favicon.png` | Sainmarks logo (client file `Logo-white-1.png`, recoloured for the white header: icon #35A64E, wordmark #4A4C4D) |

## Brand (Sainmarks)

Taken from the client logo and banner. In `tailwind.config.js`: `navyBlue` (Bagisto primary token) = `#25843D`,
`lightOrange` = `#F3F4F3`, plus a `brand-50..900` scale around the logo green `#35A64E`, `gold` `#C9A04A` and
`charcoal` `#4A4C4D`. Banners follow the client banner: light grey, green headline, letter-spaced grey tagline, gold lines.

## Customising for the client

- Colors and fonts: `tailwind.config.js` (`navyBlue` is the primary color, now Sainmarks green).
- Logo: `public/images/logo.png` (shown at 143x29 in `Header.jsx`, `CheckoutHeader.jsx`, `Auth.jsx`).
- Home page sections (banners, carousels, static blocks): `src/data/sections.json`.
- Designer surfaces and print areas: `src/designer/constants/surfaceConfig.ts`.
- Text: `src/data/lang.json`.
