**You are a world-class product designer and Figma expert specializing in building complete, production-ready web applications for complex SaaS + e-commerce platforms.**

**ABSOLUTE RULE:** This shop sells **ONLY LAPTOPS**. Every product, every category, every description, every image alt text, every marketing copy in the designs must be about laptops only. Never introduce phones, tablets, headphones, mice, external drives, monitors or any other category. All categories must be laptop types (Gaming Laptop, Ultrabook, MacBook, etc.).

## Project Overview

**Product name:** Ladux
**Domain:** Premium laptop-only e-commerce store. **Chỉ bán laptop duy nhất**. Không bán bất kỳ ngoại vi, phụ kiện, linh kiện PC, màn hình, bàn phím rời hay gadget nào khác. Toàn bộ sản phẩm trên website là Laptop (Gaming, Ultrabook, MacBook, Workstation, Business). + full Supply Chain / Procurement management for laptops only.  
**Architecture:** Backend is Spring Boot REST API (`/api/v1`). Frontend will be a modern React/Next.js app consuming these APIs via cookies.  
**Two completely separate interfaces** that must feel distinct:

- **Storefront (User/Customer)** — clean shopping experience
- **Admin Dashboard** — powerful operational tool

**CRITICAL RULE - Content Restriction:**

- Every single product shown, every image placeholder description, every category, every filter, every marketing text must refer **exclusively to laptops**.
- Never show or suggest phones, headphones, mice, keyboards, monitors, PC builds, or any accessories.
- When generating sample product names, always use real laptop models (MacBook Pro 16 M3, Dell XPS 14, Lenovo ThinkPad X1 Carbon, ASUS ROG Strix G16, MSI Stealth 16, HP ZBook, LG Gram 17, Razer Blade 16...).

**Strict Design Direction (non-negotiable):**

- **Monochromatic black & white aesthetic** with refined grays only.
- Primary surfaces and text use pure black (#000000 / #111111) on white and pure white (#FFFFFF) on dark.
- Very subtle single accent color allowed: a deep slate/indigo (#1E2937 or #334155) for active states or a soft blue-gray for focus. Do **NOT** use bright colors except for status badges (green for success, red for danger, amber for warning).
- **Full Light + Dark mode support** with a prominent, working theme toggle (sun/moon icon) in the header (user) and top navigation bar (admin).
- All components must have both Light and Dark variants.
- Premium tech feel: generous whitespace, sharp typography (Inter or similar sans), clean cards with subtle borders or very light shadows, excellent typography hierarchy.
- High-end, trustworthy, minimalist (inspired by Apple, Linear.app, Vercel, Stripe).

**Technical & Business Constraints (must be respected in the UI):**

- Authentication: HttpOnly cookies (`AUTH_TOKEN` + `REFRESH_TOKEN`). Frontend **never** stores tokens in localStorage. 401 → attempt refresh → redirect to login if fail.
- All list endpoints use Spring Data pagination (`Page`): default page size 12, max 50. Always show proper pagination or "Load more".
- Prices: Every product/order must display `basePrice` (strikethrough if `discountPrice` exists) + `discountPrice` + percentage badge when applicable. Always show 2 decimal places.
- Product `specs` is a JSON string focused **only on laptop specifications** (e.g. `{"screen":"14 inch 3K OLED 120Hz", "cpu":"Apple M3 Pro", "ram":"18GB", "storage":"512GB SSD", "gpu":"Integrated 14-core", "battery":"18 hours", "weight":"1.55kg", "ports":"2x Thunderbolt 4, HDMI, SD card"}`). Must render as a clean, professional laptop specs table.
- **Order state machine** is strict: PENDING → CONFIRMED → SHIPPED → DELIVERED. CANCELLED only from PENDING/CONFIRMED. UI must only show valid actions per state. Show visual stepper.
- Stock management is strict — show "Hết hàng", low stock warnings, and disable buy buttons when `stockQuantity <= 0`.
- Supply chain (Admin only): Purchase Orders have partial receiving, Stock Movements act as full immutable ledger.
- All forms must handle validation errors exactly as returned by backend (`message` field).
- Responsive: Desktop-first for Admin. Fully responsive (mobile friendly) for Storefront.

## Required Design System (Create this first as a dedicated page/frame)

Create a complete, reusable design system before building any screens:

**Primitives:**

- Color tokens (light + dark): background, surface, surface-2, border, text-primary, text-secondary, text-muted.
- Typography scale (H1–H6, Body, Caption, Price).
- Spacing (4px base).
- Border radius (sm/md/lg).
- Shadows (subtle).

**Core Components (with all states + Light/Dark):**

- Button variants: Primary (black/white), Secondary (outline), Ghost, Danger, Loading, Disabled. Sizes: sm, md, lg.
- Input, Textarea, Select, Search input.
- Quantity Stepper (with min/max based on stock).
- ProductCard (large and compact versions) — **only for laptops**. Must show laptop name + short spec (e.g. "14" OLED | M3 Pro | 18GB RAM"), price display, stock badge, wishlist heart, discount badge.
- DataTable (Admin) — sortable headers, row actions (edit/delete), status badges, pagination, filters, loading/empty states.
- Status Badge (OrderStatus, PaymentStatus, PurchaseOrderStatus, CustomerLevel, StockMovementType) — use very refined colors (not neon).
- Modal + Drawer (confirmation, form, detail view).
- Pagination component.
- Tabs, Toggle switch (especially for Dark mode).
- Toast / Alert.
- Empty state illustrations + messages.
- Rating Stars (display + input).
- Image Gallery (for product detail).
- Form components with error states.
- Sidebar navigation (Admin).
- Top navigation + user menu (both interfaces).
- Theme toggle component.

## Complete Sitemap & Screens to Generate

### 1. Storefront / Customer Interface (User-facing)

Layout: Sticky header (logo + search + nav links + cart icon with count + wishlist + account + theme toggle) + main content + footer.

Required screens:

1. **Home** (`/`)
   - Hero banner (strong CTA "Khám phá laptop cao cấp" — chỉ laptop)
   - Featured categories (roots) — chỉ các danh mục Laptop: Gaming Laptop, Ultrabook, MacBook, Workstation/Creator, Business Laptop
   - Product grids: "Laptop mới ra mắt", "Laptop đang giảm giá mạnh"
   - Brand logos strip
   - APIs: `GET /api/v1/products?size=12`, `GET /api/v1/categories/roots`, `GET /api/v1/brands`

2. **Products Listing** (`/products`)
   - Search bar + filters sidebar (Brands + Laptop Categories: Gaming Laptop, Ultrabook, MacBook, Workstation, Business Laptop)
   - Sort dropdown
   - Grid of ProductCard (12 per page)
   - Pagination
   - APIs: `GET /api/v1/products`, `/products/brand/{id}`, `/products/category/{id}`, search param

3. **Product Detail** (`/products/:slug`)
   - Image gallery (main + thumbnails)
   - Info block: name, brand link, price with discount logic, stock status
   - Quantity stepper + "Thêm vào giỏ" + Heart (wishlist)
   - Tabs: Mô tả + Thông số kỹ thuật (bảng specs laptop chuyên sâu) + Đánh giá
   - Reviews list + "Viết đánh giá" form (if logged in)
   - Related products
   - APIs: `GET /api/v1/products/{id}`, reviews, cart/wishlist mutations

4. **Cart** (`/cart`)
   - List of cart items with editable quantity + remove
   - Order summary (subtotal)
   - "Tiến hành thanh toán" CTA
   - Empty state

5. **Checkout** (`/checkout`)
   - Two-column layout:
     - Left: Address selector + Add new address form + Coupon input (with preview result) + Payment method radios (VNPAY, COD)
     - Right: Order summary + final total + Place order button
   - Handle coupon error states inline
   - APIs: user-addresses, `POST /api/v1/coupons/apply`, `POST /api/v1/orders`

6. **Payment / Success**
   - Payment pending screen with countdown to `paymentExpiresAt` + "Thanh toán ngay" button
   - Success page (`/checkout/success`)
   - Failure + Retry payment

7. **My Orders** (`/orders`)
   - Tabs by status
   - Order list cards
   - Order Detail page with:
     - Status stepper
     - Items
     - Timeline (order-histories)
     - Payment info + actions (retry / cancel when allowed)

8. **Wishlist** (`/wishlist`)
   - Grid of ProductCards with remove + add-to-cart

9. **Account & Addresses**
   - Profile edit (name, phone, email, avatar upload)
   - Password change (note: will log out all devices)
   - Address book (CRUD + set default)

10. **Auth pages**
    - Login (`/login`) — with Google OAuth button + rate limit warning
    - Register (`/register`)

### 2. Admin Interface (Management)

Layout: Fixed left sidebar (logo + navigation links) + top bar (search, user avatar + theme toggle + logout) + main content area (mostly DataTables + forms).

Required screens (include ALL new supply chain features):

1. **Dashboard** (`/admin`)
   - Stats cards (orders by status, revenue indicators)
   - Recent orders table
   - Quick links

2. **Products** (`/admin/products`)
   - Powerful DataTable
   - Create / Edit modal or page with full Product form (including JSON specs editor, thumbnail, multiple images, brand/category select, stock, isActive)
   - Delete with confirmation

3. **Orders** (`/admin/orders`)
   - Table with status filters
   - Update status (respect state machine — only show valid next states + tracking number input when going to SHIPPED)
   - View full order details in drawer/modal

4. **Customers (CRM)** (`/admin/customers`)
   - Table of Customer profiles (loyaltyPoints, level, totalSpent)
   - Search + filter by level
   - Edit customer profile

5. **Users** (`/admin/users`)
   - Full user management (activate/deactivate, roles)

6. **Coupons** (`/admin/coupons`)
   - CRUD + validation rules visible in form

7. **Categories** (`/admin/categories`)
   - Tree view + CRUD (parent-child)

8. **Brands** (`/admin/brands`)
   - Simple CRUD with logo

9. **Reviews** (`/admin/reviews`)
   - List + moderation actions

10. **Payments** (`/admin/payments`)
    - Read-only transaction lookup + filters

11. **Suppliers** (`/admin/suppliers`)
    - CRUD for suppliers (name, contact, isActive)

12. **Product Suppliers** (`/admin/product-suppliers`)
    - Link products to suppliers with `costPrice` and `leadTimeDays`

13. **Purchase Orders** (`/admin/purchase-orders`)
    - Create PO (select supplier + multiple items with cost)
    - Status updates
    - **Critical flow**: "Receive Goods" action — partial receive UI (select lines + quantities), which calls receive endpoint and updates stock + creates StockMovement

14. **Stock Movements** (`/admin/stock-movements`)
    - Full ledger view (filter by product)
    - "Adjustment" form (manual in/out with type and note)

## Additional Instructions for Figma AI

- Generate **one cohesive Figma file** with:
  - Page 1: Design System + Components library (with variants for light/dark)
  - Separate pages/sections for "Storefront" and "Admin"
- Every list/table screen must include 4 states: Default (data), Loading (skeletons), Empty, Error.
- Use **realistic sample data** that matches backend DTO field names.
- Make forms realistic (show validation errors, loading on submit).
- For Admin DataTables: include column sorting indicators, row hover actions, bulk select if reasonable, responsive table.
- Add clear frame labels and comments inside Figma for each major API call and data contract.
- Ensure visual consistency across both interfaces while making them feel different (Storefront is commercial & warm; Admin is dense & functional).
- Make the theme toggle functional in the prototype (use Figma variants or interactive components).

## Key API Reference (use correct endpoints and response shapes)

**Public / User:**

- Auth: `/api/v1/auth/{register,login,refresh,logout,csrf}`
- Catalog: `/api/v1/products`, `/products/{id}`, `/brands`, `/categories`
- Cart: `/api/v1/cart`
- Orders: `/api/v1/orders`, `/orders/user`, `/orders/{id}/payments/retry`
- Payments: `/api/v1/payments`
- Wishlist, Reviews, User Addresses, Coupons/apply

**Admin (all under `/api/v1/admin/...`):**

- Products, Orders (PATCH status), Users, Customers, Coupons, Brands, Categories, Reviews, Payments, Suppliers, ProductSuppliers, PurchaseOrders (POST + `/{id}/receive`), StockMovements (`/adjustments`)

**Important DTO fields examples:**

- Product (always Laptop): id, name, slug, basePrice, discountPrice, stockQuantity, thumbnail, specs (laptop-only JSON), isActive, brand, category (laptop category only)
- Order: id, status, subTotal, discountAmount, finalAmount, items[], paymentExpiresAt, shippingAddress
- StockMovement: movementType (PURCHASE_IN, SALE_OUT, RETURN_IN, ADJUSTMENT_IN/OUT...), quantity, referenceType, note

---

**Start by creating the complete Design System with Light + Dark variants.**

**Then generate all the screens listed above.**

Make the designs production-quality, extremely consistent, and directly implementable by a frontend developer.

Generate now.
