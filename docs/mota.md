# Mô tả dự án Ladux — Backend

> Tài liệu mô tả chuyên sâu phần **backend** của dự án Ladux: bài toán giải quyết, stack công nghệ, kiến trúc, domain, luồng nghiệp vụ, bảo mật, dữ liệu và vận hành.
>
> Phạm vi: `backend/` (Spring Boot modular monolith).  
> Cập nhật theo codebase hiện tại (Java 21 · Spring Boot 4.0.6 · Flyway V1–V26).

---

## 1. Ladux là gì?

**Ladux** là hệ thống web **thương mại điện tử công nghệ (B2C)** — bán laptop/thiết bị IT — kết hợp **quản trị vận hành** và **chuỗi cung ứng (procurement)**.

| Thành phần | Vai trò |
| --- | --- |
| `backend/` | REST API: auth, catalog, cart, order, payment, inventory, CRM, supply chain |
| `frontend/` | Storefront khách hàng + Admin portal (React/Vite) |
| `uploads/` | Ảnh sản phẩm, avatar, category (serve qua static mapping) |
| `docs/` | Tài liệu kiến trúc, luồng, vận hành |

Backend là **trung tâm nghiệp vụ**: mọi rule bán hàng, tồn kho, thanh toán, phân quyền đều nằm ở đây. Frontend chỉ là client gọi API.

### 1.1 Đối tượng người dùng

| Vai trò | Quyền chính |
| --- | --- |
| **CUSTOMER** | Xem catalog, giỏ hàng, wishlist, checkout, thanh toán, đơn hàng, review, địa chỉ, hồ sơ |
| **ADMIN** | Quản trị catalog, đơn hàng, user, coupon, CRM khách hàng, nhà cung cấp, đơn mua hàng (PO), biến động kho |

### 1.2 Bài toán hệ thống giải quyết

Ladux không chỉ là CRUD sản phẩm. Backend giải các bài toán thực tế của e-commerce + kho:

1. **Bán hàng online end-to-end** — từ catalog → giỏ → checkout → thanh toán → giao hàng → review.
2. **Không oversell** — trừ tồn kho atomic khi đặt hàng, có CHECK constraint và ledger audit.
3. **Thanh toán an toàn** — tích hợp VNPay IPN: xác thực HMAC, idempotency, đối soát số tiền.
4. **Vòng đời đơn hàng** — state machine (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED), tự hủy đơn quá hạn.
5. **Khuyến mãi có kiểm soát** — coupon FIXED/PERCENT, lock khi redeem, rollback khi hủy đơn.
6. **Định danh & phiên** — JWT access + refresh opaque, token versioning thu hồi tức thì, OAuth2 Google.
7. **CRM / Loyalty** — tách User (auth) và Customer (hồ sơ, điểm, hạng thành viên).
8. **Chuỗi cung ứng** — nhà cung cấp, giá nhập, đơn mua hàng, nhận hàng từng phần, sổ kho bất biến.
9. **Vận hành multi-instance** — ShedLock cho job, Redis cache + rate limit phân tán.

---

## 2. Technology Stack

| Lớp | Công nghệ | Phiên bản / Ghi chú |
| --- | --- | --- |
| Ngôn ngữ | **Java** | 21 (LTS) |
| Framework | **Spring Boot** | 4.0.6 |
| Web | Spring Web MVC | REST API servlet |
| Persistence | Spring Data JPA + Hibernate | `open-in-view=false` |
| Database | **PostgreSQL** | 17-alpine |
| Migration | **Flyway** | V1–V26 (core + devdata) |
| Cache | Spring Cache + **Redis** | TTL, `@Cacheable` / `@CacheEvict` |
| Rate limit | **Bucket4j** + Lettuce | Login: 5 req/phút/IP, lưu bucket trên Redis |
| Bảo mật | Spring Security + OAuth2 Client | JWT cookie, CSRF, roles |
| JWT | **jjwt** | 0.13.0 (HS256) |
| Distributed lock | **ShedLock** (JDBC) | Job chỉ chạy 1 instance |
| Validation | Jakarta Bean Validation | Request DTO |
| JSON | Jackson + jsr310 | Format thời gian VN (`Asia/Ho_Chi_Minh`) |
| HMAC VNPay | commons-codec | SHA-512 |
| API docs | springdoc-openapi | Swagger UI `/swagger-ui` |
| Observability | Spring Boot Actuator | health (liveness/readiness), metrics, prometheus |
| Build | Maven + Lombok | Artifact `ladux.jar` |
| Test | JUnit + Testcontainers (PostgreSQL) | Integration test |

### 2.1 Hạ tầng chạy

```text
docker-compose (backend/)
  ├── app          Spring Boot :8080  (health: /actuator/health/liveness)
  ├── postgres     PostgreSQL 17      (volume postgres-data)
  └── redis        Redis alpine AOF   (volume redis-data)
```

- Dockerfile multi-stage: Temurin 21 JDK → JRE, user non-root `ladux`.
- Ảnh upload bind-mount từ `../uploads` → `/app/uploads`.
- Biến môi trường bắt buộc: `DB_PASSWORD`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

---

## 3. Kiến trúc tổng thể

### 3.1 Modular monolith phân tầng

```text
HTTP Request
    │
    ▼
[Filter chain]
  LoginRateLimitFilter (HIGHEST)
  → CORS → CSRF → JwtFilter → Spring Security
    │
    ▼
[Controller]     user/* + admin/* + AuthController
  mỏng: map HTTP ↔ DTO, lấy principal, gọi service
    │
    ▼
[Service]        interface + impl
  business rules, @Transactional, điều phối repository
  (Inventory, Pricing, Coupon, OrderLifecycle, Payment, StockMovement...)
    │
    ▼
[Repository]     Spring Data JPA
  @EntityGraph, @Lock(PESSIMISTIC_WRITE), @Modifying atomic UPDATE
    │
    ▼
[PostgreSQL]  source of truth
[Redis]       cache + rate-limit buckets
```

**Nguyên tắc thiết kế:**

| Nguyên tắc | Cách áp dụng |
| --- | --- |
| Controller mỏng | Không chứa business rule; chống IDOR bằng `principal.getId()` |
| Service = transaction boundary | `@Transactional`; side-effect service dùng `Propagation.MANDATORY` |
| Atomic & idempotent | Trừ kho bằng `UPDATE ... WHERE stock >= qty`; webhook 2 lớp idempotency |
| DTO tách entity | Không expose entity JPA ra API |
| Ledger inventory | Mọi biến động kho có `StockMovement` (audit trail) |
| Tách identity / CRM | `User` = đăng nhập; `Customer` = hồ sơ loyalty |

### 3.2 Cấu trúc package

```text
org.akira.ladux
├── LaduxApplication.java          # @EnableJpaAuditing, @EnableScheduling, @EnableCaching
├── config/
│   ├── SecurityConfig             # JWT, CSRF, CORS, OAuth2, authorize rules
│   ├── JwtFilter                  # Đọc cookie/Bearer → SecurityContext
│   ├── LoginRateLimitFilter       # Bucket4j + Redis (POST /auth/login)
│   ├── RateLimitConfig            # Lettuce proxy manager
│   ├── OAuth2SuccessHandler       # Google login → set cookie
│   ├── ShedLockConfig             # Distributed lock cho scheduled jobs
│   ├── JacksonConfig              # Format datetime VN
│   └── WebConfig                  # Page size default 12, max 50; CORS/static
├── controller/
│   ├── AuthController             # /api/v1/auth/*
│   ├── user/                      # Storefront APIs
│   └── admin/                     # Admin APIs (@PreAuthorize ADMIN)
├── dto/request + dto/response     # Contract API
├── exception/                     # GlobalExceptionHandler + domain exceptions
├── model/ + model/enums/          # JPA entities
├── repository/                    # ~23 repositories
├── service/ + service/impl/       # ~55 service files
└── utils/SlugUtils
```

Entry point bật:

- **JPA Auditing** — tự ghi `createdAt`
- **Scheduling** — job hủy đơn PENDING quá hạn
- **Caching** — Redis cache cho đọc nhiều

---

## 4. Domain model & dữ liệu

### 4.1 Nhóm domain

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Identity   │     │   Catalog    │     │    Commerce     │
│ User, Role  │     │ Brand        │     │ Cart, Order     │
│ RefreshToken│     │ Category     │     │ Payment, Coupon │
│ UserAddress │     │ Product      │     │ Review, Wishlist│
└──────┬──────┘     │ ProductImage │     └────────┬────────┘
       │            └──────────────┘              │
       │ 1-1                                      │
       ▼                                          │
┌─────────────┐     ┌─────────────────────────────┴──────────┐
│    CRM      │     │           Supply Chain                  │
│ Customer    │     │ Supplier, ProductSupplier               │
│ loyalty     │     │ PurchaseOrder, PurchaseOrderItem        │
│ level       │     │ StockMovement (ledger)                  │
└─────────────┘     └─────────────────────────────────────────┘
```

### 4.2 Thực thể chính

| Entity | Bảng | Ý nghĩa |
| --- | --- | --- |
| `User` | `users` | Email/username unique, BCrypt password, `isActive`, `tokenVersion`, roles M2M |
| `Customer` | `customers` | Shared PK với User (`@MapsId`): fullName, phone, avatar, loyaltyPoints, level, totalSpent |
| `Product` | `products` | basePrice/discountPrice, stock, lowStockThreshold, description, specs JSONB, slug |
| `Brand` / `Category` | brands / categories | Category cây phân cấp (`parent_id`) |
| `Cart` / `CartItem` | carts / cart_items | 1 user ↔ 1 cart |
| `Order` / `OrderItem` | orders / order_items | Snapshot `priceAtPurchase`; status state machine |
| `OrderHistory` | order_histories | Audit chuyển trạng thái đơn |
| `Payment` | payments | PENDING/SUCCESS/FAILED; `transaction_no` unique (partial) |
| `Coupon` | coupons | FIXED/PERCENT + domain methods (`calculate`, `isExpired`) |
| `Review` | reviews | Unique (user, product); rating 1–5 |
| `Wishlist` | wishlists | User ↔ Product yêu thích |
| `Supplier` | suppliers | Nhà cung cấp |
| `ProductSupplier` | product_suppliers | Giá nhập + lead time; unique (product, supplier) |
| `PurchaseOrder` | purchase_orders | Đơn mua hàng: PENDING → … → RECEIVED / CANCELLED |
| `StockMovement` | stock_movements | Sổ kho bất biến (PURCHASE_IN, SALE_OUT, RETURN_IN, ADJUST…) |
| `RefreshToken` | refresh_tokens | Opaque refresh, rotation, revoke |

### 4.3 Enum quan trọng

**OrderStatus**

```text
PENDING → CONFIRMED → SHIPPED → DELIVERED
   │           │
   └───────────┴──→ CANCELLED
```

**StockMovementType:** `PURCHASE_IN`, `SALE_OUT`, `RETURN_IN`, `DAMAGE_OUT`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `OTHER`

**CustomerLevel:** `BROWSER` → `SILVER` → `GOLD` → `RUBY` (schema đã có; logic cộng điểm/thăng hạng còn mở rộng)

**PurchaseOrderStatus:** `PENDING` → `CONFIRMED` → `PARTIALLY_RECEIVED` → `RECEIVED` | `CANCELLED`

### 4.4 Flyway migrations (tóm tắt)

| Nhóm | Nội dung |
| --- | --- |
| V1 | Schema khởi tạo |
| V2–V9 | Index hot path, payment unique, stock CHECK ≥ 0, updated_at |
| V10–V13, V19 | Harden delete, ShedLock, `pg_trgm` + GIN index search mờ |
| V15–V17 | Coupon created_at, review rating CHECK, order_histories.user_id |
| V20–V21 | refresh_tokens, users.token_version |
| **V22** | **Customer + Supply chain** (suppliers, PO, stock_movements) |
| V23–V26 | Mock data supply chain, ảnh product/category |

Profile **dev** chạy thêm `db/devdata` (seed). Profile **prod** chỉ validate schema, không auto-DDL.

---

## 5. Các module nghiệp vụ & API

Prefix chung: **`/api/v1`**

### 5.1 Auth (`AuthController`)

| Endpoint | Mô tả |
| --- | --- |
| `POST /auth/register` | Đăng ký CUSTOMER, BCrypt password |
| `POST /auth/login` | Login + set cookie JWT (rate-limited) |
| `POST /auth/refresh` | Rotate refresh token → access mới |
| `POST /auth/logout` | Revoke refresh + tăng tokenVersion |
| `GET /auth/csrf` | Cấp CSRF token cho frontend |
| OAuth2 Google | `/oauth2/**` → set cookie → redirect frontend |

### 5.2 Catalog (public GET)

- **Products** — list/search (keyword, brand, category), by id/slug, active only  
- **Brands / Categories** — list, by id/name/slug; categories roots  
- **Product images** — gallery theo product  
- **Reviews** — list theo product (public)

Admin CRUD: brands, categories (+ upload ảnh), products, product images (multipart).

### 5.3 Giỏ hàng & Wishlist

- Cart: GET / add item / update qty / remove item / clear — userId từ principal (chống IDOR)  
- Wishlist: add / list / remove theo productId  

Cart lock `FOR UPDATE` khi sửa để tránh race.

### 5.4 Order & Payment

**Customer**

| Endpoint | Mô tả |
| --- | --- |
| `POST /orders` | Checkout từ giỏ |
| `GET /orders/user` | Đơn của tôi |
| `GET /orders/{id}` | Chi tiết (chỉ chủ đơn) |
| `POST /orders/{id}/payments/retry` | Thử lại thanh toán |
| `GET/POST /payments/vnpay-webhook` | IPN VNPay (public) |
| `POST /coupons/apply` | Preview giảm giá |

**Admin:** list orders theo status, patch status; payments CRUD/query.

### 5.5 CRM & Supply chain (Admin)

| Module | Endpoint base | Chức năng |
| --- | --- | --- |
| Customers | `/admin/customers` | List, search, filter by level, update profile/loyalty |
| Suppliers | `/admin/suppliers` | CRUD nhà cung cấp |
| Product–Supplier | `/admin/product-suppliers` | Gán giá nhập, lead time |
| Purchase orders | `/admin/purchase-orders` | Tạo PO, đổi status, **receive** (nhập kho) |
| Stock movements | `/admin/stock-movements` | Query ledger + manual adjustment |

### 5.6 User profile

- `GET/PUT /users/me`, upload avatar  
- User addresses: CRUD + default  

---

## 6. Luồng nghiệp vụ trọng tâm

### 6.1 Checkout (`OrderServiceImpl.createOrder`)

Một transaction duy nhất:

```text
1. Validate user active
2. Lock cart (FOR UPDATE)
3. InventoryService.reserveStockAndPriceLines
     → UPDATE products SET stock = stock - qty WHERE stock >= qty
     → chốt giá (discountPrice || basePrice) → LineDraft
4. CouponRedemptionService.redeem (lock coupon, tăng usedCount)
5. Build Order (PENDING) + OrderItems (priceAtPurchase) + OrderHistory
6. PaymentAttemptService → Payment PENDING + paymentExpiresAt
7. Save order; clear cart (orphanRemoval)
8. StockMovement.recordLedgerEntry(SALE_OUT)  // chỉ ghi sổ, không trừ stock lần 2
```

**Kết quả:** không bán vượt tồn, giá chốt cứng, coupon an toàn, audit kho đầy đủ.

### 6.2 Inventory — chống oversell

Chiến lược **atomic conditional UPDATE** (không giữ pessimistic lock lâu):

```sql
UPDATE products
SET stock_quantity = stock_quantity - :qty
WHERE id = :id AND stock_quantity >= :qty
```

- `rowsAffected == 0` → `InsufficientStockException`  
- Lưới đôi: CHECK `stock_quantity >= 0` (migration V9)  
- Service inventory bắt buộc chạy trong transaction cha (`MANDATORY`)

### 6.3 Hủy đơn & hết hạn thanh toán

- User/admin hủy khi `PENDING` hoặc `CONFIRMED`  
- Job `expirePendingOrders` (mỗi ~60s + **ShedLock**): hủy PENDING quá `paymentExpiresAt`  
- Side-effect qua `OrderLifecycleService`:
  - Cộng lại stock + `recordLedgerEntry(RETURN_IN)`
  - Rollback lượt coupon
  - Ghi OrderHistory

### 6.4 Webhook VNPay (production-grade)

```text
1. Verify HMAC SHA-512 TRƯỚC khi đụng DB  → reject 403 nếu giả mạo
2. Parse orderId, amount, transactionNo, responseCode
3. Idempotency 2 lớp:
     - State check (payment đã SUCCESS → no-op)
     - Unique transaction_no (partial unique index)
4. Đối soát amount với order.finalAmount
5. SUCCESS → OrderLifecycle.confirmAfterSuccessfulPayment
   FAILED  → cancel order + release inventory
```

Không update Order “thủ công” trong webhook — luôn đi qua lifecycle/state machine.

### 6.5 Nhập hàng (Purchase Order receive)

```text
1. Lock PO (FOR UPDATE)
2. Với mỗi dòng nhận:
     lock Product → StockMovement.recordMovement(PURCHASE_IN)
     (cộng stock + ghi sổ)
     cập nhật receivedQuantity
3. Tự advance status:
     PARTIALLY_RECEIVED | RECEIVED
```

Hỗ trợ **nhận từng phần** (partial receive).

### 6.6 StockMovement — Ledger pattern

| Method | Hành vi | Khi nào dùng |
| --- | --- | --- |
| `recordMovement` | **Mutate stock + ghi sổ** | PO receive, manual adjustment |
| `recordLedgerEntry` | **Chỉ ghi sổ** | Checkout (đã trừ atomic), cancel (đã cộng lại) |

Ưu điểm: mọi biến động đều trace được; dễ reconcile tồn kho; không double-count.

### 6.7 Review

- Chỉ review khi user có đơn **DELIVERED** chứa sản phẩm đó  
- Unique 1 user / 1 product  

---

## 7. Bảo mật

### 7.1 Session & Token

| Thành phần | Chi tiết |
| --- | --- |
| Access JWT | ~15 phút; claims: userId, roles, **tokenVersion**, jti |
| Refresh opaque | ~7 ngày; lưu DB; cookie path hẹp `/api/v1/auth` |
| Cookie | HttpOnly, SameSite configurable (mặc định Strict) |
| tokenVersion | Logout / đổi pass / khóa TK → tăng version → mọi access token cũ chết ngay |
| JwtFilter | Cookie `AUTH_TOKEN` hoặc Bearer; kiểm tra isEnabled + tokenVersion |

### 7.2 CSRF & CORS

- CSRF bật (cookie-based SPA): frontend lấy `XSRF-TOKEN`, gửi header `X-XSRF-TOKEN`  
- Miễn CSRF: login/register/refresh/logout, VNPay webhook, OAuth2, request Bearer  
- CORS: localhost:3000 + domain production; `allowCredentials`  

### 7.3 Rate limiting

- `LoginRateLimitFilter` — precedence cao nhất  
- Chỉ `POST /api/v1/auth/login`  
- Bucket4j + Redis: **5 lần / 1 phút / IP** (ưu tiên `X-Forwarded-For`)  
- Vượt → **429** + `Retry-After`  

### 7.4 Phân quyền

- Public: auth, catalog GET, reviews GET, webhook, swagger, health/info, uploads  
- Authenticated: cart, orders, payments, wishlist, addresses, profile  
- ADMIN: `/api/v1/admin/**`, actuator chi tiết  
- Method security: `@PreAuthorize("hasRole('ADMIN')")`  
- Ownership check ở service (order.userId == principal)  

### 7.5 Mã hóa

- Password: **BCrypt**  
- VNPay: **HMAC-SHA512**  

---

## 8. Consistency, transaction & concurrency

| Kỹ thuật | Mục đích |
| --- | --- |
| `@Transactional` trên service write | Atomic multi-table |
| `Propagation.MANDATORY` | Side-effect không chạy ngoài TX cha |
| Atomic stock UPDATE | Chống oversell khi concurrent checkout |
| `SELECT ... FOR UPDATE` | Cart, coupon, order lifecycle, PO receive |
| Unique partial index payment | Idempotency webhook |
| ShedLock | Job expire order chỉ 1 instance |
| `open-in-view=false` | Tránh lazy load ngoài TX (N+1/session leak) |

---

## 9. Cache, search & performance

### Cache (Redis)

- `@Cacheable` trên đọc: products, orders, carts…  
- `@CacheEvict(allEntries = true)` trên write (đơn giản, hit-rate chưa tối ưu)  
- TTL mặc định theo cấu hình Redis cache manager  

### Search

- PostgreSQL **`pg_trgm`** + GIN index trên `lower(name)`  
- Tìm mờ keyword catalog (ổn cho catalog vừa; scale lớn hơn cần OpenSearch/ES)  

### Pagination

- Default page size **12**, max **50** (WebConfig)  
- Tránh client kéo full table  

---

## 10. Xử lý lỗi

`GlobalExceptionHandler` → `ErrorResponse` thống nhất:

| Exception | HTTP |
| --- | --- |
| `ResourceNotFoundException` | 404 |
| `BusinessRuleException` / validation | 400 |
| `InsufficientStockException` | 400 (nghiệp vụ) |
| Auth fail | 401 |
| AccessDenied / CSRF invalid | 403 |
| DataIntegrity (unique/FK) | 409 |
| Unhandled | 500 (log full) |

---

## 11. Profiles & cấu hình

| Profile | Đặc điểm |
| --- | --- |
| **dev** | show-sql, flyway devdata, seed mock, cookie secure=false |
| **prod** | schema validate, không sql init, cookie secure, secret bắt buộc env |
| **test** | application-test.properties + Testcontainers |

Biến then chốt:

```text
SPRING_PROFILES_ACTIVE, DB_HOST, DB_USERNAME, DB_PASSWORD
JWT_SECRET, JWT_ACCESS_EXPIRATION_MS, JWT_REFRESH_EXPIRATION_MS
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
AUTH_COOKIE_*, OAUTH2_SUCCESS_REDIRECT
UPLOAD_ROOT, payment.vnpay.secret-key
app.rate-limit.login.capacity / refill-minutes
```

Upload: max file 5MB, request 20MB; thư mục products / avatars / categories.

---

## 12. Kiểm thử

Vị trí: `backend/src/test/java/org/akira/ladux/`

Các hướng đã có / hướng tới:

- Unit/service: Order, Pricing, StockMovement flow  
- Rate limit login  
- Integration với **Testcontainers PostgreSQL**  
- Cần bổ sung: concurrency checkout (oversell), PO receive song song sale, webhook edge cases  

Build:

```powershell
cd backend
mvn -q -DskipTests package   # build ladux.jar
mvn -q test                  # chạy test
```

---

## 13. Điểm mạnh & nợ kỹ thuật

### Điểm mạnh

- Kiến trúc phân tầng rõ, DTO đầy đủ  
- Atomic inventory + ledger audit  
- Checkout / cancel / webhook đi qua lifecycle thống nhất  
- JWT + refresh rotation + tokenVersion  
- Rate limit login phân tán  
- Supply chain + CRM schema đã tách domain  
- Actuator health cho Docker/K8s  
- Flyway versioned migrations  

### Nợ / hướng mở rộng

| Hạng mục | Ghi chú |
| --- | --- |
| AuthenticationEntryPoint REST thuần | Một số request unauth có thể không 401 JSON chuẩn |
| Soft delete | Hiện chủ yếu `isActive` filter |
| Loyalty accrual | Schema có points/level; logic cộng điểm sau DELIVERED chưa đầy đủ |
| Cache granular | Đang `allEntries=true` → hit-rate thấp |
| Secret management | Tránh fallback secret trong compose/dev; dùng vault/CI secrets |
| Observability | Prometheus đã expose; cần structured log + tracing + dashboard |
| Outbox / domain events | Email, notification async |
| Search scale | Trigram → OpenSearch khi catalog lớn |
| Soft concurrent tests | Race checkout/PO |

---

## 14. Tóm tắt một câu

> **Ladux backend** là REST API Spring Boot (Java 21) cho e-commerce công nghệ: auth JWT/OAuth2, catalog, cart/checkout với tồn kho atomic, coupon, thanh toán VNPay idempotent, CRM loyalty, và procurement (PO + stock ledger) — triển khai modular monolith trên PostgreSQL + Redis, sẵn sàng scale ngang với ShedLock và health probes.

---

## 15. Tài liệu liên quan

| File | Nội dung |
| --- | --- |
| [README.md](../README.md) | Chạy dự án, env, overview |
| [00-tong-quan-du-an.md](./00-tong-quan-du-an.md) | Tổng quan full-stack |
| [02-kien-truc-backend.md](./02-kien-truc-backend.md) | Kiến trúc phân tầng chi tiết |
| [03-luong-nghiep-vu.md](./03-luong-nghiep-vu.md) | Sequence end-to-end |
| [04-co-so-du-lieu-va-module.md](./04-co-so-du-lieu-va-module.md) | DB & module |
| [backend/docs/kien-truc-backend.md](../backend/docs/kien-truc-backend.md) | Single source of truth kiến trúc backend (sâu) |
| `database/ladux_erd.png` | Sơ đồ ERD |

---

*Tài liệu này phản ánh hiện trạng code trong `backend/src/main`. Khi thêm domain/module lớn, nên cập nhật song song file này và `backend/docs/kien-truc-backend.md`.*
