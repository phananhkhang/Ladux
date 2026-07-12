# Ladux Frontend

Premium laptop-only e-commerce storefront + admin dashboard.

**Stack:** React 18 · Vite · Tailwind CSS 4 · Radix UI · React Router 7 · Recharts · Lucide

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build   # production build → dist/
```

## Routes

### Storefront
| Path | Screen |
|------|--------|
| `/` | Home — hero, categories, new arrivals, on sale |
| `/products` | Catalog — filters, sort, pagination |
| `/products/:slug` | Product detail — gallery, specs, reviews |
| `/cart` | Shopping cart |
| `/checkout` | Address, coupon, VNPAY/COD |
| `/payment` · `/payment/success` · `/payment/failed` | Payment flow |
| `/orders` | Order history + status stepper |
| `/wishlist` | Saved products |
| `/account` | Profile, password, addresses |
| `/login` · `/register` | Auth (Google OAuth button + form) |

### Admin (`/admin`)
| Path | Screen |
|------|--------|
| `/admin` | Dashboard — KPIs, charts, recent orders |
| `/admin/products` | Catalog CRUD |
| `/admin/categories` · `/brands` · `/reviews` | Catalog support |
| `/admin/orders` | Orders + state machine + tracking drawer |
| `/admin/customers` · `/coupons` · `/payments` · `/users` | Sales ops |
| `/admin/suppliers` · `/product-suppliers` · `/purchase-orders` · `/stock-movements` | Supply chain |

## Notes

- UI currently uses **mock data** (`src/app/data/mock.tsx`) and local cart/wishlist/theme state (`src/app/data/store.tsx`).
- Design system: monochrome black/white + light/dark theme toggle.
- Coupon demo: `LADUX10` for 10% off at checkout.
- Next step for production: wire pages to Spring Boot `/api/v1` with HttpOnly cookie auth.
