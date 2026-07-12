# Ladux Backend — Tài liệu Kiến trúc & Tri thức Hệ thống

> Tài liệu kỹ thuật mô tả **chính xác hiện trạng** codebase `backend/`.
> Mục đích: nguồn tham chiếu duy nhất (single source of truth) về kiến trúc, mô hình dữ liệu,
> luồng nghiệp vụ, bảo mật, vận hành và hướng phát triển.
>
> Cập nhật lần cuối: 2026-06-24 (cập nhật sâu từ 2026-06-13) · Phạm vi: toàn bộ `backend/src/main` + migration V22–V23 + tests.

---

## 1. Tổng quan hệ thống

Ladux là backend **thương mại điện tử công nghệ** (B2C) kết hợp **quản lý chuỗi cung ứng** (procurement) theo kiến trúc **modular monolith** phân lớp truyền thống (Controller → Service → Repository).

**Đối tượng người dùng:**
- `CUSTOMER`: mua sắm, giỏ hàng, thanh toán VNPay/COD, review, wishlist.
- `ADMIN`: quản trị catalog, đơn hàng, người dùng, **khách hàng (CRM)**, **nhà cung cấp**, đơn mua hàng (PO), biến động kho.

**Nghiệp vụ cốt lõi (đã mở rộng):**

**B2C E-commerce:**
- Catalog: Brand, Category (cây phân cấp), Product (+description, lowStockThreshold), ProductImage, specs JSONB.
- Mua sắm: Cart → Checkout (Order state machine + atomic stock), OrderHistory, Payment + VNPay IPN webhook (production-grade).
- Khuyến mãi & Tương tác: Coupon (domain logic rich), Review (1 user/product), Wishlist.
- Định danh: Register/Login/Refresh/Logout (JWT cookie + opaque refresh + tokenVersion), OAuth2 Google, UserAddress.

**Mở rộng quan trọng (từ V22):**
- **CRM & Loyalty**: Tách biệt `Customer` (shared PK 1-1 với User) chứa fullName, phone, avatar, loyaltyPoints, level (BROWSER→SILVER→GOLD→RUBY), totalSpent.
- **Supply Chain / Procurement**: Supplier, ProductSupplier (giá nhập + lead time), PurchaseOrder + PurchaseOrderItem (vòng đời PENDING→CONFIRMED→PARTIALLY_RECEIVED→RECEIVED / CANCELLED), StockMovement (toàn bộ audit trail biến động kho).

Hệ thống ưu tiên **an toàn dữ liệu** (atomic deduct stock, pessimistic lock khi redeem coupon/PO receive, idempotency webhook, rollback khi hủy đơn).

---

## 2. Technology Stack

| Lớp | Công nghệ | Phiên bản / Ghi chú |
|-----|-----------|---------------------|
| Ngôn ngữ | Java | 21 (LTS) |
| Framework | Spring Boot | 4.0.6 (Boot 4 + tools.jackson) |
| Web | Spring Web MVC | REST + servlet |
| Persistence | Spring Data JPA + Hibernate | open-in-view=false, @EntityGraph, pessimistic lock |
| Database | PostgreSQL | 17-alpine |
| Migration | Flyway | versioned V1–V23 (core + devdata) |
| Cache | Spring Cache + Redis | `@EnableCaching`, RedisCacheManager, TTL 10 phút mặc định |
| Rate Limit | Bucket4j (core + lettuce) | 8.14.0, distributed trên Redis, LoginRateLimitFilter |
| Bảo mật | Spring Security + OAuth2 Client | JwtFilter, tokenVersion, CSRF cookie + Bearer exemption |
| JWT | jjwt | 0.13.0 |
| Lock phân tán | ShedLock (jdbc-template) | 7.7.0 |
| Validation | Jakarta Bean Validation |  |
| JSON | Jackson (databind 2.21.2) + jsr310 + tools.jackson | Custom Instant/LocalDateTime formatter (dd-MM-yyyy HH:mm:ss, Asia/Ho_Chi_Minh) |
| Mã hóa | commons-codec | 1.22.0 (HMAC VNPay) |
| API Docs | springdoc-openapi | 3.0.3 |
| Observability | Spring Boot Actuator | health (liveness/readiness), info, metrics, prometheus |
| Build | Maven + Lombok | finalName=ladux |

**Đóng gói & Deploy:**
- Multi-stage Dockerfile: Temurin 21-jdk-alpine → jre-alpine, non-root `ladux` user, volume uploads.
- docker-compose: app + postgres:17-alpine + redis:alpine, healthchecks đầy đủ (`/actuator/health/liveness`, pg_isready, redis ping).
- Entry point: `LaduxApplication` với `@SpringBootApplication`, `@EnableJpaAuditing`, `@EnableScheduling`, `@EnableCaching`.

**Biến môi trường then chốt:** JWT_SECRET, GOOGLE_*, VNPAY_SECRET_KEY, DB_*, AUTH_COOKIE_*, UPLOAD_ROOT, SPRING_PROFILES_ACTIVE.

---

## 3. Kiến trúc phân lớp & Cấu trúc Package

```
HTTP Request
   │
   ▼
[Filter chain]  LoginRateLimitFilter (HIGHEST) → UrlHandlerFilter → CORS → CSRF → JwtFilter → Spring Security
   │
   ▼
[Controller]    (user/* + admin/*) — mỏng, chỉ map DTO + principal
   ▼
[Service]       (interface + impl) — business logic + @Transactional (thường MANDATORY cho side-effect)
   │             InventoryService, PricingService, CouponRedemptionService, OrderLifecycleService,
   │             OrderStateMachine, Payment*Service, StockMovementService, PurchaseOrderService...
   ▼
[Repository]    Spring Data JPA + custom @Lock, @Modifying, @EntityGraph, atomic update
   ▼
[DB + Redis]    PostgreSQL (source of truth) + Redis (cache + bucket4j rate limit buckets)
```

**Nguyên tắc cốt lõi (Senior Architect view):**
- **Controller cực mỏng**: không business rule. Lấy userId từ `@AuthenticationPrincipal UserPrincipal` (chống IDOR).
- **Service là transaction boundary**: đặc biệt `@Transactional(propagation = Propagation.MANDATORY)` cho các service xử lý side-effect (OrderLifecycleService, InventoryService, CouponRedemptionService, StockMovement record).
- **Atomic & Idempotent**: stock deduct bằng UPDATE điều kiện (không oversell), coupon lock khi redeem, webhook 2 lớp idempotency (state + unique constraint).
- **Rich domain + Ledger**: Coupon có method calculate/isExpired; StockMovement tách rõ mutate (recordMovement) vs pure audit (recordLedgerEntry).
- **Separation of concerns**: User = identity/auth + roles; Customer = CRM/loyalty; StockMovement = immutable ledger cho mọi biến động kho (không chỉ sale).

### 3.1 Cấu trúc package hiện tại (cập nhật)

```
org.akira.ladux
├── LaduxApplication.java
├── config/
│   ├── JacksonConfig.java          # custom time format + zone
│   ├── JwtFilter.java
│   ├── LoginRateLimitFilter.java   # mới: bucket4j + Redis, highest precedence
│   ├── RateLimitConfig.java        # RedisClient + LettuceBasedProxyManager riêng
│   ├── OAuth2SuccessHandler.java
│   ├── SecurityConfig.java
│   ├── ShedLockConfig.java
│   └── WebConfig.java
├── controller/
│   ├── AuthController.java
│   ├── user/                       # Customer-facing (order, cart, catalog, payment, review...)
│   └── admin/                      # 17+ controllers
│       ├── AdminBrand/Category/Coupon/Order/... 
│       ├── AdminCustomerController.java
│       ├── AdminSupplierController.java
│       ├── AdminProductSupplierController.java
│       ├── AdminPurchaseOrderController.java
│       └── AdminStockMovementController.java
├── dto/ (request + response + internal: LineDraft, CouponRedemptionResult, PaymentWebhookResult)
├── exception/ (BusinessRule, InsufficientStock, ResourceNotFound, GlobalExceptionHandler)
├── model/
│   ├── User (auth + roles + tokenVersion + 1-1 Customer)
│   ├── Customer (CRM profile, loyalty)
│   ├── Supplier, ProductSupplier
│   ├── PurchaseOrder, PurchaseOrderItem
│   ├── StockMovement
│   └── enums/ (RoleName, OrderStatus, PurchaseOrderStatus, StockMovementType, StockReferenceType, CustomerLevel, ...)
├── repository/ (23 repos, nhiều có find...ForUpdate, search trigram, isActive filters)
├── service/ + service/impl/ (55+ files)
│   └── mới: CustomerService, SupplierService, ProductSupplierService, PurchaseOrderService, StockMovementService
└── utils/SlugUtils.java
```

---

## 4. Mô hình dữ liệu (Domain Model)

### 4.1 ERD logic (cập nhật)

```
User 1───1 Customer (shared PK @MapsId, CRM profile + loyalty)
User 1───* Order *───1 Coupon (optional)
          │
          ├──* OrderItem *──1 Product
          ├──* OrderHistory (user_id từ V17)
          └──* Payment

User 1───1 Cart 1───* CartItem *──1 Product
User *──* Role (user_roles)
User *──* UserAddress
User *──* RefreshToken

Brand 1───* Product *───1 Category (self-ref parent_id)
Product 1───* ProductImage
Product 1───* Review (unique user+product)
Product 1───* Wishlist

# Supply Chain (V22+)
Supplier 1───* ProductSupplier *───1 Product   (costPrice, leadTimeDays)
Supplier 1───* PurchaseOrder 1───* PurchaseOrderItem *───1 Product
Product 1───* StockMovement   (full immutable ledger: PURCHASE_IN / SALE_OUT / RETURN_IN / ADJUST / ...)

```

### 4.2 Bảng thực thể chính (cập nhật chi tiết)

| Entity | Bảng | Điểm quan trọng |
|--------|------|-----------------|
| `User` | users | email + username unique, password BCrypt, isActive, tokenVersion, roles M2M. **Không còn** full_name/phone/avatar (đã migrate sang Customer V22). |
| `Customer` | customers | **Shared PK** (id = user_id, @MapsId + @OneToOne). fullName, phone, avatarUrl, loyaltyPoints, level (enum), totalSpent. Tách biệt identity vs CRM. |
| `Product` | products | basePrice/discountPrice, stockQuantity, lowStockThreshold (default 5), description TEXT, specs JSONB, slug, isActive, createdAt/updatedAt. |
| `Supplier` | suppliers | name, contact, isActive, audit created/updated. |
| `ProductSupplier` | product_suppliers | N-N + giá nhập (costPrice), lead_time_days. Unique (product,supplier). |
| `PurchaseOrder` | purchase_orders | supplier, status (PENDING/CONFIRMED/PARTIALLY_RECEIVED/RECEIVED/CANCELLED), totalAmount, expectedDeliveryDate, createdBy (User), items. |
| `PurchaseOrderItem` | purchase_order_items | product, quantity, costPrice, receivedQuantity (hỗ trợ nhận từng phần). |
| `StockMovement` | stock_movements | product, signed quantity, movementType (6 loại), referenceType (ORDER/PURCHASE_ORDER/ADJUSTMENT...), referenceId, createdBy, createdAt. **Audit trail bất biến**. |
| `Order` | orders | subTotal, discountAmount, finalAmount, status, shippingAddress, paymentExpiresAt, trackingNumber. Cascade ALL + orphanRemoval. update_at (legacy name). |
| `OrderItem` | order_items | priceAtPurchase (immutable snapshot). |
| `Coupon` | coupons | discountType/FIXED/PERCENT + domain logic (calculate, isExpired, isUsageLimitReached). |
| `RefreshToken` | refresh_tokens | opaque, revoked, expiry, FK cascade. |
| Khác | ... | reviews (unique + rating CHECK 1-5), wishlists, payments (transaction_no unique partial), categories (self-ref), brands. |

### 4.3 Domain logic & Inventory Ledger (sâu sắc)

**Rich domain:**
- `Coupon`: calculateDiscount + validation methods. Dùng chung preview & redeem.
- `RefreshToken.isUsable()`.

**StockMovement — Ledger pattern (rất quan trọng):**
- `recordMovement(...)`: **mutate stock + ghi sổ** (dùng cho PO receive, manual adjustment). Dùng findForUpdate + set + save movement. Kiểm tra newStock >=0.
- `recordLedgerEntry(...)`: **chỉ ghi sổ**, KHÔNG mutate (dùng khi stock đã thay đổi nguyên tử ở chỗ khác: checkout SALE_OUT, cancel RETURN_IN).
- Tích hợp đầy đủ:
  - Checkout (OrderServiceImpl): atomic deduct (Inventory) → save order → recordLedgerEntry SALE_OUT.
  - PO receive (PurchaseOrderService): lock PO + lock product → recordMovement (PURCHASE_IN) → update receivedQty → advance status.
  - Cancel/Expire (OrderLifecycleService): lock product → cộng stock → recordLedgerEntry RETURN_IN → rollback coupon.
- Ưu điểm: audit đầy đủ, dễ trace, dễ báo cáo tồn kho, dễ reconcile.

**Order lifecycle tách biệt side-effect qua OrderLifecycleService (MANDATORY propagation).**

---

## 5. Schema & Flyway Migrations

**Quy ước:** forward-only, versioned. Core migration luôn chạy; devdata chỉ dev.

**Các migration quan trọng (cập nhật):**

- V1: schema khởi tạo (legacy: full_name trong users, update_at trên products).
- V2–V9: indexes hot path, seed, payment unique partial, stock CHECK >=0, updated_at, category constraints.
- V10–V13, V19: harden delete, shedlock, pg_trgm + GIN trigram index `lower(name)` cho search mờ.
- V14: rename updated_at → update_at (sau đó V22 đảo ngược trên products).
- V15–V17: coupon created, review rating CHECK, order_histories user_id.
- V20: refresh_tokens.
- **V21**: users.token_version.
- **V22 (lớn)**: 
  - Tạo customers (di trú data từ users), drop full_name/phone/avatar/created_at khỏi users, widen username.
  - Products: thêm description + low_stock_threshold, rename update_at → updated_at.
  - Suppliers + product_suppliers + purchase_orders + purchase_order_items + stock_movements.
- **V23**: dev mock data cho supply chain.

**Cấu hình Flyway (vẫn còn rủi ro):**
- dev: validate=false, baseline=true, repair=true, **clean-on-validation-error=true** (nguy hiểm — chỉ dev).
- prod: ddl-auto=validate, sql.init=never, clean-disabled ngầm.

---

## 6. Bảo mật (Security)

**Cấu hình trung tâm:** `SecurityConfig` (stateless, JwtFilter trước UsernamePassword).

### 6.1 Hai token + Token Versioning (vẫn mạnh)

- Access JWT (15 phút): chứa userId, roles, tokenVersion, jti.
- Refresh opaque (7 ngày, rotation): lưu DB, path cookie hẹp.
- `tokenVersion` trong User + claim → logout/đổi pass/khóa tài khoản → tăng version → mọi access token chết tức thì.
- JwtFilter kiểm tra isEnabled() + tokenVersion khớp.

### 6.2 Rate Limiting Login (mới, quan trọng)

`LoginRateLimitFilter` (@Order HIGHEST_PRECEDENCE, chạy trước mọi thứ):
- Chỉ áp cho POST /api/v1/auth/login.
- Bucket4j + Redis (Lettuce proxy manager riêng, expiration 10 phút).
- Default: 5 lần / 1 phút theo IP (X-Forwarded-For ưu tiên).
- Vượt → 429 + Retry-After.
- Distributed: an toàn khi scale ngang.

Cấu hình: `app.rate-limit.login.capacity` / `refill-minutes`.

### 6.3 OAuth2, CSRF, CORS, Cookie

- OAuth2: chỉ cho user đã tồn tại + active → set cookie → redirect frontend.
- CSRF: CookieCsrf (HttpOnly=false), bỏ qua cho auth endpoints + webhook + Bearer.
- CORS: localhost:3000 + ladux.vn, allowCredentials.
- Cookie: HttpOnly, configurable secure/sameSite (Strict mặc định), refresh path hẹp.

### 6.4 Phân quyền & Chống IDOR

- Public: auth, catalog GET, webhook, health/info, swagger, uploads.
- ADMIN: actuator đầy đủ + admin APIs.
- `@PreAuthorize("hasRole('ADMIN')")` + service ownership check (order.user == principal).
- User lấy từ principal, không tin client.

### 6.5 Vấn đề còn tồn (cần fix)

- Chưa có `AuthenticationEntryPoint` tùy chỉnh → một số request API chưa auth có thể bị xử lý theo oauth2 redirect thay vì 401 JSON thuần (mặc dù JwtFilter xử lý nhiều trường hợp).
- Secret fallback vẫn tồn tại trong dev properties/docker (xem upgrade plan).

---

## 7. Luồng nghiệp vụ trọng tâm (cập nhật)

### 7.1 Checkout (OrderServiceImpl.createOrder) — @Transactional

1. Validate user active.
2. Lock cart (`findByUserIdForUpdate`).
3. Reserve stock + giá: `InventoryService.reserveStockAndPriceLines` (atomic UPDATE stock >= qty).
4. Coupon redeem (lock coupon).
5. Build Order + OrderItem (priceAtPurchase snapshot) + OrderHistory.
6. initializePayment + paymentExpiresAt.
7. Save order (clear cart qua orphanRemoval).
8. **Ghi ledger**: recordLedgerEntry SALE_OUT (không mutate lại stock).

### 7.2 Hủy đơn & Hoàn tác (OrderLifecycleService + StateMachine)

- `cancelOrder`: chỉ khi PENDING/CONFIRMED.
- releaseReservedInventory: lock product → +stock → recordLedgerEntry RETURN_IN.
- rollbackCoupon.
- Ghi history.

`expirePendingOrders` (scheduled + ShedLock) tự động cancel quá hạn.

### 7.3 Thanh toán + Webhook VNPay (vẫn production-grade)

- Verify HMAC **trước** DB.
- Idempotency 2 lớp (state + unique transaction_no).
- Đối soát amount.
- SUCCESS → OrderLifecycle.confirmAfterSuccessfulPayment (idempotent).
- FAILED → cancel.

### 7.4 Supply Chain — Luồng nhập hàng (mới)

**PurchaseOrderService:**
- create: build PO + items, tính total, status PENDING.
- updateStatus: validate transition, chỉ cho CANCEL ở PENDING/CONFIRMED.
- **receiveGoods** (quan trọng):
  - Lock PO (forUpdate).
  - Với mỗi line nhận: lock Product, gọi `stockMovementService.recordMovement(..., PURCHASE_IN, ref=PO)` (cộng stock + ghi sổ).
  - Cập nhật receivedQuantity.
  - Tự động advance status: PARTIALLY_RECEIVED hoặc RECEIVED khi đủ.
- Hỗ trợ nhận từng phần + note per item.

**StockMovementService (admin):**
- createAdjustment: recordMovement (có sign theo type).
- Các query theo product / all.

Tích hợp chặt với inventory: không bao giờ mutate stock ngoài các đường dẫn được kiểm soát.

### 7.5 Định giá & Kho

- Pricing: discountPrice || basePrice.
- Inventory atomic + CHECK constraint làm lưới đôi.

---

## 8. Caching (Redis)

Vẫn dùng `@Cacheable` + blanket `@CacheEvict(allEntries = true)` ở hầu hết write path (orders, products, users, coupons...).

**Hạn chế:** hit-rate thấp, không granular. Backlog vẫn còn (xem hướng đi).

---

## 9. Xử lý lỗi

GlobalExceptionHandler thống nhất ErrorResponse. Xử lý tốt:
- ResourceNotFound → 404
- Validation + BusinessRule → 400
- Auth fail → 401 (không lộ chi tiết)
- AccessDenied → 403
- DataIntegrity (23505 unique, 23503 FK...) → 409 với message nghiệp vụ
- Fallback 500 (log full)

AccessDenied + CSRF xử lý custom JSON trong SecurityConfig.

---

## 10. Cấu hình & Profiles

- **application.properties**: env-driven, actuator health probes (liveness/readiness include db+redis), rate limit config.
- **dev**: show-sql, flyway devdata + clean-on-validation-error (nguy hiểm), redis cache.
- **prod**: secure cookie, no sql, validate only.
- Jackson custom formatter + zone VN.
- Upload: 5MB file / 20MB request, separate dirs (products, avatars).

---

## 11. Triển khai

- Dockerfile non-root + health.
- docker-compose đầy đủ health + volumes + network.
- Static resources /uploads mapped.

Actuator health: liveness cho container, readiness cho K8s.

---

## 12. API Surface (tổng quan)

Prefix: `/api/v1`

**Auth:** register, login (rate-limited), refresh, logout, csrf.

**User (CUSTOMER):**
- products, brands, categories (public GET), cart, orders, payments (retry + webhook public), reviews, wishlist, user-addresses, user profile.

**Admin (ADMIN role):**
- Full CRUD cho Brand, Category, Coupon, Order, Product, User, Review, UserAddress...
- **Mới:** `/admin/customers` (get by level, update profile/loyalty), `/admin/suppliers`, `/admin/product-suppliers`, `/admin/purchase-orders` (create/receive/update status), `/admin/stock-movements` (adjustments + query).

Phân trang mặc định 12, max 50. Trailing slash chuẩn hóa.

---

## 13. Điểm mạnh, Nợ kỹ thuật & Tiến độ Upgrade Plan

**Điểm mạnh (giữ vững):**
- Atomic stock + ledger audit đầy đủ (không oversell, trace được mọi biến động).
- Tách side-effect qua MANDATORY propagation (OrderLifecycle, PO receive).
- Webhook VNPay: signature trước, idempotency, amount match.
- TokenVersion + rotation refresh: thu hồi tức thì.
- ShedLock + scheduled an toàn multi-instance.
- Tách User/Customer rõ ràng (identity vs CRM).
- Supply chain đã được xây dựng với receive partial + status machine.

**Tiến độ từ BACKEND_UPGRADE_PLAN (đến 2026-06-24):**
- ✅ Actuator + health + docker healthcheck.
- ✅ Rate limiting login (bucket4j).
- ✅ Nhiều test (OrderServiceTest, StockMovementFlowTest, LoginRateLimitTest, Pricing..., integration, repo).
- ✅ Supply chain (V22) + stock ledger.
- ✅ Một số cache/redis, trigram, idempotency payment fix.
- ⬜ AuthenticationEntryPoint REST 401 thuần.
- ⬜ Soft delete (hiện chỉ dùng isActive + filter).
- ⬜ Secret management thực thụ + rotate.
- ⬜ Khóa flyway dev nguy hiểm.
- ⬜ Cache granular (vẫn allEntries).
- ⬜ Observability đầy đủ (metrics + log structured + tracing).
- ⬜ Outbox/events.

**Rủi ro còn lại:**
- Column naming không nhất quán (update_at vs updated_at).
- Loyalty/totalSpent chưa có logic accrual.
- Test coverage còn mỏng ở một số flow phức hợp (concurrent PO receive + sale).
- Secrets fallback trong repo.
- Cache hit-rate thấp.

---

## 14. Hướng đi tiếp theo (Roadmap chi tiết từ góc nhìn Senior System Architect)

Dưới đây là phân tích sâu và lộ trình đề xuất, ưu tiên **an toàn dữ liệu + vận hành + scalability** trước khi mở rộng tính năng.

### Giai đoạn Ngắn hạn (1–4 tuần — Production Hardening)

1. **Authentication & Session**
   - Thêm `AuthenticationEntryPoint` + `AccessDeniedHandler` chuẩn REST: luôn trả 401/403 JSON cho `/api/**`, chỉ cho phép redirect OAuth2 trên `/oauth2/**`.
   - Xác nhận behavior hiện tại của JwtFilter + Security khi gọi API không token.

2. **Soft Delete & Data Retention**
   - Thêm cột `deleted_at` / `is_deleted` cho User, Product, Supplier, PurchaseOrder, Order (nếu cần).
   - Cập nhật mọi query công khai + admin list dùng filter `deleted_at IS NULL`.
   - Soft delete user phải cascade logic (vô hiệu hóa Customer, cart, address, không xóa order history).
   - Migration + backfill.

3. **Secret & Config Hardening**
   - Loại bỏ **tất cả** fallback secret (JWT, VNPay, Google) khỏi `application-dev.properties`, `docker-compose.yml`, `.env.example`.
   - Bắt buộc env trong compose (như đã làm một phần).
   - Giới thiệu secret manager (Doppler / HashiCorp Vault / AWS SM) hoặc ít nhất external .env gitignored + CI secret.
   - Rotate các secret đã từng commit.

4. **Flyway & DB Discipline**
   - Xóa `clean-on-validation-error=true` khỏi mọi cấu hình dùng chung. Chỉ giữ trong profile `local-destructive`.
   - Thêm `flyway.clean-disabled=true` ở prod.
   - Viết script migration repair khi cần (không tự động).

5. **Loyalty & CRM Business Rules**
   - Thiết kế + implement: sau khi đơn DELIVERED (hoặc CONFIRMED) → cộng loyaltyPoints + totalSpent (theo % finalAmount hoặc rule cứng).
   - Rule thăng cấp level (BROWSER → SILVER sau N điểm / X chi tiêu).
   - Trigger ở OrderLifecycleService (sau confirm) hoặc event sau.
   - Admin có thể override/adjust điểm.

6. **Mở rộng Test Pyramid (rất cấp thiết)**
   - Concurrency test: nhiều thread cùng lúc checkout cùng sản phẩm (đảm bảo không oversell + ledger đúng).
   - PO receive partial + concurrent sale.
   - Webhook VNPay idempotency + amount mismatch cases.
   - Integration full flow với Testcontainers (đã có AbstractIntegrationTest).
   - Property-based test cho pricing/coupon nếu có thời gian.
   - Tăng coverage các service mới (Customer, Supplier, PO, StockMovement).

### Giai đoạn Trung hạn (1–3 tháng — Reliability & Efficiency)

7. **Cache Strategy**
   - Bỏ blanket `allEntries=true` → evict theo key cụ thể (`products:id:xx`, `orders:user:yy`).
   - Dùng `GenericJackson2JsonRedisSerializer` + TTL per cache (hoặc @Cacheable với config riêng).
   - Cân nhắc cache-aside chủ đích cho hot catalog (brand/category filter).

8. **Observability 3 Trụ**
   - Micrometer + Prometheus + `/actuator/prometheus` (đã expose).
   - Logback JSON + MDC `X-Request-Id` / traceId (filter + interceptor).
   - OpenTelemetry (nếu có collector) cho tracing qua service (dù monolith vẫn có ích khi sau này tách).
   - Dashboard Grafana cơ bản (latency p50/p95/p99, error rate, DB pool, cache hit, stock low alerts).

9. **DB Performance & Indexing**
   - Partial index: `orders (payment_expires_at) WHERE status = 'PENDING'`.
   - Index stock_movements (product_id, created_at), purchase_orders (expected_delivery_date, status).
   - Analyze EXPLAIN ANALYZE cho search + report query.
   - Tune Hikari: max pool, leak detection, connection timeout.

10. **Idempotency & Resilience**
    - Idempotency-Key header cho POST /orders và POST /admin/purchase-orders.
    - Retry policy cho VNPay webhook (hiện đã idempotent).
    - Circuit breaker (Resilience4j) cho external (nếu thêm email/SMS).

11. **API & Contract**
    - Dùng OpenAPI làm source of truth, sinh client cho frontend.
    - Version API nếu breaking (v1 hiện tại ổn).

### Giai đoạn Dài hạn (3–9 tháng — Growth & Evolution)

12. **Domain Events + Outbox Pattern**
    - Giới thiệu `ApplicationEventPublisher` + bảng `outbox`.
    - Side-effect (gửi email xác nhận đơn, thông báo PO nhận hàng, cập nhật điểm loyalty) chạy async, đảm bảo consistency.
    - Sau này thay bằng Kafka nếu cần event-driven.

13. **Bounded Context & Modular Monolith**
    - Tách rõ module/package: 
      - identity (User + Refresh + Auth)
      - catalog (Product/Brand/Category + search)
      - ordering (Cart/Order/Payment + lifecycle)
      - crm (Customer + loyalty)
      - procurement (Supplier/PO/StockMovement)
    - Dùng package-private + interface rõ ràng giữa module.
    - Khi traffic lớn hoặc team tách: cân nhắc tách service (nhưng chỉ khi chi phí vận hành xứng đáng).

14. **Advanced Inventory & Supply**
    - Low stock alert (scheduled job + notification khi stock < lowStockThreshold).
    - Suggested reorder: dựa lead_time + historical sale velocity.
    - Wholesale pricing (giá khác cho level GOLD/RUBY hoặc bulk).
    - Multi-warehouse nếu cần (mở rộng StockMovement + location).

15. **Search & Analytics**
    - Trigram hiện đủ cho catalog nhỏ. Khi > vài chục nghìn sản phẩm → OpenSearch/Elasticsearch (fulltext + facet + autocomplete).
    - Analytics dashboard: top sellers, supplier performance (on-time delivery, cost variance), customer LTV, abandoned cart.

16. **Security nâng cao**
    - Thêm rate limit register, password reset.
    - Account lockout tạm thời sau N lần login fail (dùng Redis).
    - MFA (TOTP) cho admin.
    - Security headers (HSTS, CSP...).
    - OWASP dependency check + Trivy trong CI.

17. **CI/CD & Ops**
    - GitHub Actions: build → test (Testcontainers) → OWASP/Trivy scan → docker build & push → deploy (staging/prod).
    - Image hardening: distroless hoặc alpine minimal, no devtools, sbom.
    - Backup/restore DB định kỳ + restore test.
    - Runbook sự cố (DB down, Redis full, VNPay outage, mass stock adjustment).

**Nguyên tắc chỉ đạo (Senior Architect):**
- An toàn dữ liệu và audit trail luôn thắng tính năng mới.
- Mỗi thay đổi phải có test + migration + doc.
- Tránh premature microservices. Modular monolith + rõ ràng context là lựa chọn tối ưu cho giai đoạn này.
- Prefer idempotency, atomic DB operation, ledger thay vì distributed transaction khi có thể.
- Luôn nghĩ "nếu scale gấp 10, ta sẽ đau ở đâu?" (cache, DB pool, search, stock race, observability).

---

> Tài liệu này là "living document". 
> Mọi thay đổi kiến trúc, thêm domain mới (loyalty accrual, warehouse, events), hoặc refactor lớn **bắt buộc** phải cập nhật file này đồng thời.
> 
> "Good architecture is when you can add new features without reading the entire codebase." — Hãy giữ cho nó như vậy.
