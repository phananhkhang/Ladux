You are a world-class product designer and Figma expert specializing in production-ready web applications for complex SaaS + e-commerce platforms.
ABSOLUTE RULE: This platform sells only laptops. Every product, category, description, image, and marketing copy must refer exclusively to laptops (Gaming Laptop, Ultrabook, MacBook, Workstation, Business Laptop). Never include phones, tablets, accessories, or any other product type.
Project Overview
Product: Ladux — Premium laptop-only e-commerce store with full Supply Chain & Procurement management.
Architecture: Backend is Spring Boot REST API (/api/v1). Frontend is a modern React/Next.js app using HttpOnly cookies for authentication.
Two distinct interfaces:

Storefront (Customer): Clean shopping experience
Admin Dashboard: Powerful operational tool

Design Direction (Non-negotiable)

Monochromatic black & white aesthetic with refined grays only.
Primary surfaces: pure black (#000000 / #111111) on white and pure white on dark.
Single subtle accent: deep slate/indigo (#1E2937 or #334155).
Status colors only: green (success), red (danger), amber (warning).
Full Light + Dark mode support with a working theme toggle (sun/moon icon).
Premium tech feel: generous whitespace, sharp typography (Inter), clean cards, excellent hierarchy.
High-end, minimalist style inspired by Apple, Linear, Vercel, and Stripe.

Technical & Business Constraints

Authentication uses HttpOnly cookies (AUTH_TOKEN + REFRESH_TOKEN). Never store tokens in localStorage. Handle 401 with refresh logic.
All list endpoints use Spring Data pagination (default size 12, max 50). Always include proper pagination or “Load more”.
Prices: Show basePrice (strikethrough if discountPrice exists) + discountPrice + percentage badge. Always display 2 decimal places.
specs is a JSON string containing only laptop specifications. Render as a clean, professional specs table.
Strict order state machine: PENDING → CONFIRMED → SHIPPED → DELIVERED. CANCELLED only from PENDING or CONFIRMED. Show visual stepper and only valid actions per state.
Stock management: Show “Hết hàng”, low stock warnings, and disable purchase when stockQuantity <= 0.
Supply chain (Admin): Purchase Orders support partial receiving. Stock Movements act as an immutable ledger.
All forms must display validation errors exactly as returned by the backend.
Responsive: Desktop-first for Admin. Fully responsive for Storefront.

Design System (Create First)
Create a complete, reusable design system with Light + Dark variants:
Primitives:

Color tokens (background, surface, surface-2, border, text-primary, text-secondary, text-muted)
Typography scale (H1–H6, Body, Caption, Price)
Spacing (4px base)
Border radius (sm/md/lg)
Subtle shadows

Core Components (all states + Light/Dark):

Button (Primary, Secondary, Ghost, Danger, Loading, Disabled; sizes: sm/md/lg)
Input, Textarea, Select, Search input
Quantity Stepper (respect stock limits)
ProductCard (large + compact) — laptop only: name, short specs, price, stock badge, wishlist heart, discount badge
DataTable (Admin): sortable headers, row actions, status badges, pagination, filters, loading/empty states
Status Badge (OrderStatus, PaymentStatus, PurchaseOrderStatus, CustomerLevel, StockMovementType)
Modal + Drawer
Pagination, Tabs, Toggle switch
Toast / Alert
Empty state
Rating Stars (display + input)
Image Gallery
Form components with error states
Sidebar navigation (Admin)
Top navigation + user menu (both interfaces)
Theme toggle component

Sitemap & Screens
1. Storefront (Customer Interface)
Sticky header (logo + search + nav + cart + wishlist + account + theme toggle) + footer.
Required screens:

Home (/) — Hero banner, featured categories (Gaming, Ultrabook, MacBook, Workstation, Business), “New Arrivals”, “On Sale”, brand logos.
Products Listing (/products) — Search + filters (Brand + Category), sort, ProductCard grid (12/page), pagination.
Product Detail (/products/:slug) — Image gallery, price & stock, quantity stepper, add to cart + wishlist, tabs (Description / Specs table / Reviews), related products.
Cart (/cart) — Editable items, order summary, checkout CTA, empty state.
Checkout (/checkout) — Address selector + add new, coupon input, payment method (VNPAY/COD), order summary.
Payment / Success — Payment pending (with countdown), success page, failure + retry.
My Orders (/orders) — Tabs by status, order cards, order detail with status stepper, timeline, items, actions (retry/cancel when allowed).
Wishlist (/wishlist) — ProductCard grid with remove + add-to-cart.
Account & Addresses — Profile edit, password change, address book (CRUD + default).
Auth — Login (Google OAuth) and Register.

2. Admin Dashboard
Fixed left sidebar + top bar (search + user + theme toggle + logout).
Required screens:

Dashboard (/admin) — Stats cards, recent orders table, quick links.
Products (/admin/products) — DataTable + Create/Edit modal (full form including JSON specs, images, brand/category, stock).
Orders (/admin/orders) — Table with status filters, update status (respect state machine), tracking input, detail drawer.
Customers (/admin/customers) — Table with loyalty points, level, total spent; search & filter by level.
Users (/admin/users) — User management (activate/deactivate, roles).
Coupons (/admin/coupons) — CRUD with validation rules.
Categories (/admin/categories) — Tree view + CRUD.
Brands (/admin/brands) — CRUD with logo.
Reviews (/admin/reviews) — List + moderation.
Payments (/admin/payments) — Read-only transaction lookup.
Suppliers (/admin/suppliers) — CRUD.
Product Suppliers (/admin/product-suppliers) — Link products to suppliers with costPrice and leadTimeDays.
Purchase Orders (/admin/purchase-orders) — Create PO, status updates, Receive Goods flow (partial receive UI).
Stock Movements (/admin/stock-movements) — Full ledger + manual adjustment form.

Additional Instructions

Every list/table screen must include 4 states: Default, Loading (skeletons), Empty, Error.
Use realistic sample data matching backend DTO field names.
Forms must show realistic validation errors and loading states on submit.
Admin DataTables: include sorting indicators, row hover actions, responsive behavior.
Add clear frame labels and comments for major API calls.
Maintain visual consistency while making Storefront feel commercial and Admin feel dense & functional.
Theme toggle must be interactive (use variants or interactive components).

Key API Reference
Use correct endpoints and response shapes as defined in the original backend contract (Product, Order, StockMovement, etc.). All admin endpoints are under /api/v1/admin/... where applicable.