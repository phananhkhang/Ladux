# Mô tả dự án Ladux — Backend

> Tài liệu mô tả chuyên sâu phần **backend** của dự án Ladux: bài toán giải quyết, stack công nghệ, kiến trúc, domain, luồng nghiệp vụ, bảo mật, dữ liệu và vận hành.
>
> Phạm vi: `backend/` (Spring Boot modular monolith).  
> Cập nhật theo codebase hiện tại (Java 21 · Spring Boot 4.0.6 · Flyway V1–V43).

---

## 1. Ladux là gì?

**Ladux** là hệ thống web **thương mại điện tử công nghệ (B2C)** — bán laptop/thiết bị IT — kết hợp **quản trị vận hành** và **chuỗi cung ứng (procurement)**.

| Thành phần | Vai trò |
| :--- | :--- |
| `backend/` | REST API: auth, catalog, cart, order, payment, inventory, CRM, supply chain, rate limit |
| `frontend/` | Storefront khách hàng + Admin portal (React/Vite) |
| `uploads/` | Ảnh sản phẩm, avatar, category (serve qua static mapping) |
| `docs/` | Tài liệu kiến trúc, luồng, vận hành |

Backend là **trung tâm nghiệp vụ**: mọi rule bán hàng, tồn kho, thanh toán, phân quyền đều nằm ở đây. Frontend chỉ là client gọi API.

### 1.1 Đối tượng người dùng

| Vai trò | Quyền chính |
| :--- | :--- |
| **CUSTOMER** | Xem catalog, giỏ hàng, wishlist, checkout, thanh toán, đơn hàng, review, địa chỉ, hồ sơ |
| **ADMIN** | Quản trị catalog, đơn hàng, user, coupon, CRM khách hàng, nhà cung cấp, đơn mua hàng (PO), biến động kho |

### 1.2 Bài toán hệ thống giải quyết

Ladux không chỉ là CRUD sản phẩm. Backend giải các bài toán thực tế của e-commerce + kho:

1. **Bán hàng online end-to-end** — từ catalog → giỏ → checkout → thanh toán → giao hàng → review.
2. **Không oversell** — trừ tồn kho atomic khi đặt hàng, có CHECK constraint và ledger audit.
3. **Thanh toán an toàn** — tích hợp VNPay IPN: xác thực HMAC, idempotency, đối soát số tiền.
4. **Vòng đời đơn hàng** — state machine (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED / RETURNED / REFUNDED), tự hủy đơn quá hạn.
5. **Khuyến mãi có kiểm soát** — coupon FIXED/PERCENT, lock khi redeem, rollback khi hủy đơn.
6. **Định danh & phiên** — JWT access + refresh opaque, token versioning thu hồi tức thì, OAuth2 Google.
7. **CRM / Loyalty** — tách User (auth) và Customer (hồ sơ, điểm, hạng thành viên).
8. **Chuỗi cung ứng** — nhà cung cấp, giá nhập, đơn mua hàng, nhận hàng từng phần, sổ kho bất biến.
9. **Vận hành multi-instance** — ShedLock cho job, Redis cache + rate limit phân tán.

---

## 2. Technology Stack

| Lớp | Công nghệ | Phiên bản / Ghi chú |
| :--- | :--- | :--- |
| Ngôn ngữ | **Java** | 21 (LTS) |
| Framework | **Spring Boot** | 4.0.6 |
| Web | Spring Web MVC | REST API servlet |
| Persistence | Spring Data JPA + Hibernate | `open-in-view=false` |
| Database | **PostgreSQL** | 17-alpine |
| Migration | **Flyway** | V1–V43 (schema versioning & extensions) |
| Cache | Spring Cache + **Redis** | TTL, `@Cacheable` / `@CacheEvict` |
| Rate limit | **Bucket4j** + Lettuce | Lưu bucket trên Redis (Login, Register, OTP, Order, Search, Chatbot) |
| Bảo mật | Spring Security + OAuth2 Client | Bearer JWT, Refresh Token Cookie HttpOnly, CSRF stateless, RBAC |
| JWT | **jjwt** | 0.13.0 (HS256) |
| Distributed lock | **ShedLock** (JDBC) | Job chỉ chạy 1 instance trên cụm backend |
| Validation | Jakarta Bean Validation | Request DTO |
| JSON | Jackson + jsr310 | Format thời gian VN (`Asia/Ho_Chi_Minh`) |
| HMAC VNPay | commons-codec | SHA-512 |
| API docs | springdoc-openapi | Swagger UI `/swagger-ui.html` |
| Observability | Spring Boot Actuator | health (liveness/readiness), metrics, prometheus |
| Build | Maven + Lombok | Artifact `ladux.jar` |
| Test | JUnit 5 + Testcontainers (PostgreSQL) | Integration test |

### 2.1 Hạ tầng chạy

```text
docker-compose (backend/)
  ├── app          Spring Boot :8080  (health: /actuator/health/liveness)
  ├── postgres     PostgreSQL 17      (volume postgres-data)
  └── redis        Redis alpine AOF   (volume redis-data)
```

---

## 3. Kiến trúc tổng thể

### 3.1 Modular monolith phân tầng

```text
HTTP Request
    │
    ▼
[Filter chain]
  EndpointRateLimitFilter (Bucket4j + Redis)
  → JwtFilter (Bearer Token & Token Versioning)
  → Spring Security (Stateless Authorization)
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

---

## 4. Domain Model & Dữ Liệu

### 4.1 Thực thể chính

| Entity | Bảng | Ý nghĩa |
| :--- | :--- | :--- |
| `User` | `users` | Email/username unique, BCrypt password, `isActive`, `tokenVersion`, roles M2M |
| `Customer` | `customers` | Shared PK với User (`@MapsId`): fullName, phone, avatar, loyaltyPoints, level |
| `Product` | `products` | Base entity sản phẩm: specs JSONB, slug, thumbnail, brand, category |
| `ProductVariant` | `product_variants` | Biến thể SKU, RAM, ROM, Color, Price, DiscountPrice, StockQuantity (CHECK ≥ 0) |
| `Brand` / `Category` | brands / categories | Thương hiệu & Cây danh mục phân cấp |
| `Cart` / `CartItem` | carts / cart_items | 1 user ↔ 1 cart; cart_items liên kết ProductVariant |
| `Order` / `OrderItem` | orders / order_items | Snapshot `priceAtPurchase`; status state machine, shipping fee, carrier |
| `OrderHistory` | order_histories | Audit chuyển trạng thái đơn |
| `Payment` | payments | PENDING/SUCCESS/FAILED; `merchant_txn_ref`, `transaction_no` |
| `Coupon` | coupons | FIXED/PERCENT, min order value, usage limit |
| `Review` | reviews | Unique (user, product); rating 1–5 (chỉ review sau DELIVERED) |
| `Wishlist` | wishlists | User ↔ Product yêu thích |
| `Supplier` | suppliers | Nhà cung cấp thiết bị |
| `ProductSupplier` | product_suppliers | Giá nhập tham chiếu |
| `PurchaseOrder` | purchase_orders | Đơn mua hàng: DRAFT → ORDERED → PARTIALLY_RECEIVED → RECEIVED |
| `StockMovement` | stock_movements | Sổ kho bất biến (PURCHASE_IN, SALE_OUT, RETURN_IN, ADJUST…) |
| `RefreshToken` | refresh_tokens | Opaque refresh token, rotation, revoke |

---

## 5. Các Luồng Nghiệp Vụ Trọng Tâm

### 5.1 Checkout (`OrderServiceImpl.createOrder`)
Một transaction duy nhất:
```text
1. Validate user active
2. Lock cart (FOR UPDATE)
3. InventoryService.reserveStockAndPriceLines
     → UPDATE product_variants SET stock = stock - qty WHERE id = :id AND stock >= qty
     → chốt giá (discountPrice || basePrice) → LineDraft
4. CouponRedemptionService.redeem (lock coupon, tăng usedCount)
5. Build Order (PENDING) + OrderItems (priceAtPurchase) + OrderHistory
6. PaymentAttemptService → Payment PENDING + paymentExpiresAt
7. Save order; clear cart (orphanRemoval)
8. StockMovement.recordLedgerEntry(SALE_OUT)  // chỉ ghi sổ cái, không trừ stock lần 2
```

### 5.2 Inventory — Chống oversell
Chiến lược **atomic conditional UPDATE**:
```sql
UPDATE product_variants
SET stock_quantity = stock_quantity - :qty
WHERE id = :id AND stock_quantity >= :qty
```
- `rowsAffected == 0` → `InsufficientStockException`
- Lưới đôi: constraint `CHECK (stock_quantity >= 0)` (migration V9)
- Service inventory bắt buộc chạy trong transaction cha (`Propagation.MANDATORY`).

### 5.3 Webhook VNPay (Production-Grade)
```text
1. Verify HMAC SHA-512 TRƯỚC khi đụng DB  → reject 400 nếu giả mạo
2. Parse merchantTxnRef, amount, transactionNo, responseCode
3. Khóa Payment theo merchantTxnRef (FOR UPDATE)
4. Idempotency check (payment đã SUCCESS → no-op)
5. Đối soát amount với order.finalAmount
6. SUCCESS → OrderLifecycle.confirmAfterSuccessfulPayment
   FAILED  → ghi nhận thất bại
```

---

## 6. Bảo Mật & Phân Quyền

| Thành phần | Chi tiết |
| :--- | :--- |
| **Access JWT** | Ngắn hạn; gửi qua header `Authorization: Bearer <token>`; validate chữ ký và `token_version` |
| **Refresh Token** | Dài hạn (7 ngày); lưu DB; nằm trong Cookie `HttpOnly + Secure + SameSite` |
| **Token Versioning** | Đổi pass / đăng xuất → tăng `token_version` trên `User` → toàn bộ token cũ bị hủy ngay |
| **Rate Limiting** | `EndpointRateLimitFilter` kết hợp Bucket4j trên Redis kiểm soát IP/User cho Login, OTP, Register, Order, Search |
| **Phân quyền** | `@PreAuthorize("hasRole('ADMIN')")` cho toàn bộ Admin APIs; kiểm tra quyền sở hữu IDOR trên các API đơn hàng/thanh toán |

---

## 7. Tóm tắt một câu

> **Ladux backend** là REST API Spring Boot 4 (Java 21) cho e-commerce công nghệ: auth JWT stateless + OAuth2, catalog & variants, cart/checkout với tồn kho atomic, coupon, thanh toán VNPay idempotent, CRM loyalty, và procurement (PO + stock ledger) — triển khai modular monolith trên PostgreSQL 17 + Redis 7, sẵn sàng scale ngang với ShedLock và health probes.
