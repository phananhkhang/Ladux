# AuraTech Backend — Tài liệu Kiến trúc & Tri thức Hệ thống

> Tài liệu kỹ thuật mô tả chính xác hiện trạng codebase `backend/`.
> Mục đích: nguồn tham chiếu duy nhất (single source of truth) về kiến trúc, mô hình dữ liệu,
> luồng nghiệp vụ, bảo mật và vận hành của backend AuraTech.
>
> Cập nhật lần cuối: 2026-06-13 · Phạm vi: toàn bộ `backend/src/main`

---

## 1. Tổng quan hệ thống

AuraTech là backend thương mại điện tử (e-commerce) cho mặt hàng công nghệ, xây dựng theo
kiến trúc **modular monolith** phân lớp truyền thống. Hệ thống cung cấp REST API cho hai nhóm
người dùng: khách hàng (`CUSTOMER`) và quản trị viên (`ADMIN`).

**Nghiệp vụ cốt lõi:**
- Catalog: thương hiệu (brand), danh mục (category — phân cấp cây), sản phẩm (product), ảnh sản phẩm.
- Mua hàng: giỏ hàng (cart), đặt hàng (order), vòng đời đơn (order state machine), lịch sử đơn.
- Thanh toán: payment + webhook VNPay (IPN), retry, hết hạn thanh toán tự động.
- Khuyến mãi: coupon (giảm theo % hoặc số tiền cố định) với giới hạn lượt dùng.
- Tương tác: đánh giá (review), danh sách yêu thích (wishlist).
- Định danh: đăng ký/đăng nhập, JWT cookie, refresh token, OAuth2 Google, địa chỉ giao hàng.

---

## 2. Technology Stack

| Lớp | Công nghệ | Phiên bản / Ghi chú |
|-----|-----------|---------------------|
| Ngôn ngữ | Java | 21 |
| Framework | Spring Boot | 4.0.6 (spring-boot-starter-parent) |
| Web | Spring Web MVC (`spring-boot-starter-webmvc`) | REST, servlet stack |
| Persistence | Spring Data JPA + Hibernate | `open-in-view=false` |
| Database | PostgreSQL | 17 (alpine trong Docker), driver runtime |
| Migration | Flyway + `flyway-database-postgresql` | versioned migration V1–V21 |
| Cache | Spring Cache + Redis (`spring-boot-starter-data-redis`) | `@EnableCaching`, RedisCacheManager |
| Bảo mật | Spring Security + OAuth2 Client | `@EnableWebSecurity`, `@EnableMethodSecurity` |
| JWT | jjwt (io.jsonwebtoken) | 0.13.0, HMAC-SHA |
| Lock phân tán | ShedLock (spring + jdbc-template) | 7.7.0, cho scheduled job |
| Validation | `spring-boot-starter-validation` | Jakarta Bean Validation |
| JSON | Jackson (databind) + jsr310 | tools.jackson API (Jackson 3 trên Boot 4) |
| Mã hóa/Hash | commons-codec | 1.22.0, HMAC-SHA512 cho VNPay |
| API Docs | springdoc-openapi (webmvc-ui) | 3.0.3, Swagger UI |
| Observability | Spring Boot Actuator | health probes, metrics, prometheus |
| Null-safety | JSpecify | 1.0.0 |
| Tiện ích build | Lombok | 1.18.38, DevTools (runtime) |

**Đóng gói:** Maven, `finalName=aura-tech`, Docker multi-stage (Temurin 21 JDK build → JRE alpine runtime, chạy non-root).

**Entry point:** `org.akira.auratech.AuraTechApplication` với các annotation kích hoạt:
`@SpringBootApplication`, `@EnableJpaAuditing` (audit `@CreatedDate`), `@EnableScheduling` (job hết hạn đơn),
`@EnableCaching` (Redis cache).

---

## 3. Kiến trúc phân lớp

```
HTTP Request
   │
   ▼
[ Filter chain ]  UrlHandlerFilter (trailing slash) → CORS → CSRF → JwtFilter → Spring Security
   │
   ▼
[ Controller ]  controller/ (AuthController, user/*, admin/*)
   │  ── nhận DTO request, trả DTO response, lấy principal qua @AuthenticationPrincipal
   ▼
[ Service ]     service/ (interface) + service/impl/ (triển khai)
   │  ── chứa toàn bộ business logic, @Transactional, @Cacheable/@CacheEvict
   ▼
[ Repository ]  repository/ (Spring Data JPA)
   │  ── query, pessimistic lock, atomic update, @EntityGraph
   ▼
[ Database ]    PostgreSQL (+ Redis cho cache, + shedlock table)
```

**Nguyên tắc tách lớp:**
- **Controller** mỏng: chỉ điều phối, không chứa nghiệp vụ. Lấy `userId` từ `UserPrincipal` (không tin tham số client).
- **Service** là nơi đặt transaction boundary và business rule. Nhiều service nhỏ chuyên trách
  (single responsibility): `InventoryService`, `PricingService`, `CouponRedemptionService`,
  `OrderLifecycleService`, `OrderStateMachine`, `PaymentAttemptService`...
- **DTO** tách biệt request/response khỏi entity (`dto/request`, `dto/response`), entity không bao giờ lộ trực tiếp ra API.
- **Mapping** entity → DTO qua static factory (vd `OrderResponse.fromEntity`, `summaryFromEntity`).

### 3.1 Cấu trúc package

```
org.akira.auratech
├── AuraTechApplication.java         # main + enable annotations
├── config/                          # JwtFilter, SecurityConfig, OAuth2SuccessHandler,
│                                    #   ShedLockConfig, WebConfig, JacksonConfig
├── controller/
│   ├── AuthController.java          # /api/v1/auth (login, register, refresh, logout, csrf)
│   ├── user/                        # API cho CUSTOMER (orders, cart, products, payments...)
│   └── admin/                       # API quản trị (Admin*Controller)
├── dto/
│   ├── request/                     # *Request records
│   ├── response/                    # *Response records
│   ├── CouponRedemptionResult.java  # DTO nội bộ (coupon + discountAmount)
│   ├── LineDraft.java               # dòng đặt hàng tạm (product, qty, price, lineTotal)
│   └── PaymentWebhookResult.java    # kết quả xử lý webhook + mã trả VNPay
├── exception/                       # GlobalExceptionHandler + custom exceptions + ErrorResponse
├── model/                           # JPA entities
│   └── enums/                       # OrderStatus, PaymentStatus, PaymentProvider, DiscountType, RoleName
├── repository/                      # Spring Data JPA repositories
├── service/ + service/impl/         # interface + triển khai
└── utils/                           # SlugUtils
```

---

## 4. Mô hình dữ liệu (Domain Model)

### 4.1 Sơ đồ quan hệ (ERD logic)

```
User 1───* Order *───1 Coupon
 │           │
 │           ├──* OrderItem *──1 Product
 │           ├──* OrderHistory
 │           └──* Payment
 │
 ├──1 Cart 1───* CartItem *──1 Product
 ├──* UserAddress
 ├──* Review *──1 Product
 ├──* Wishlist *──1 Product
 ├──* RefreshToken
 └──* Role  (Many-to-Many qua user_roles)

Brand 1───* Product *───1 Category (Category tự tham chiếu: parent_id → cây phân cấp)
Product 1───* ProductImage
```

### 4.2 Bảng thực thể chính

| Entity | Bảng | Điểm đáng chú ý |
|--------|------|-----------------|
| `User` | `users` | `tokenVersion` (vô hiệu hóa access token tức thì), `isActive` (khóa tài khoản), Many-to-Many `roles`, OneToOne `cart`. `@PrePersist` set `createdAt`. |
| `Role` | `roles` | enum `RoleName` (ADMIN, CUSTOMER). |
| `Product` | `products` | `basePrice`/`discountPrice` (NUMERIC 15,2), `stockQuantity`, `specs` JSONB (`@JdbcTypeCode(JSON)`), `slug` unique, `isActive`. Audit `createdAt`/`updateAt`. |
| `Brand` | `brands` | `slug` unique, `logoUrl`. |
| `Category` | `categories` | tự tham chiếu `parent_id` (FK → categories.id) tạo cây danh mục. |
| `Cart` / `CartItem` | `carts` / `cart_items` | mỗi user 1 cart (`user_id` unique); `cart_items` unique `(cart_id, product_id)`. |
| `Order` | `orders` | `subTotal`, `discountAmount`, `finalAmount`, `status` (enum STRING), `paymentExpiresAt`, `trackingNumber`, `shippingAddress`. Cascade ALL + orphanRemoval cho items/histories/payments. |
| `OrderItem` | `order_items` | `priceAtPurchase` (chốt giá tại thời điểm mua — immutable price snapshot). |
| `OrderHistory` | `order_histories` | audit trail chuyển trạng thái, có `user_id` (V17). |
| `Payment` | `payments` | `provider`, `transactionNo` (mã giao dịch gateway, unique khi NOT NULL), `amount`, `status`. |
| `Coupon` | `coupons` | `discountType`, `discountValue`, `minOrderValue`, `usageLimit`, `usedCount`, `expiresAt`. **Domain logic ngay trên entity** (xem 4.3). |
| `Review` | `reviews` | unique `(user_id, product_id)` (1 review/user/sản phẩm), `rating` có CHECK constraint (V16). |
| `Wishlist` | `wishlists` | unique `(user_id, product_id)`. |
| `RefreshToken` | `refresh_tokens` | opaque token (chuỗi random base64url 48 byte), `expiryDate`, `revoked`. FK `ON DELETE CASCADE`. |
| `UserAddress` | `user_addresses` | `isDefault`, thông tin giao hàng. |

### 4.3 Domain logic đặt trên entity (Rich Domain Model một phần)

`Coupon` đóng gói luật nghiệp vụ ngay trong entity, dùng chung cho cả preview (`applyCoupon`) và commit (`redeem`):
- `isExpired()` — hết hạn khi `expiresAt` không còn ở tương lai.
- `isUsageLimitReached()` — `usageLimit != null && usedCount >= usageLimit`.
- `isBelowMinOrderValue(subTotal)` — đơn chưa đạt giá trị tối thiểu.
- `calculateDiscount(subTotal)` — tính giảm giá (PERCENT chia 100 làm tròn HALF_UP, hoặc FIXED_AMOUNT),
  **không vượt quá subTotal**, làm tròn 2 chữ số.

`RefreshToken.isUsable()` — `!revoked && expiryDate ở tương lai`.

### 4.4 Kiểu dữ liệu & quy ước
- **Tiền tệ:** luôn `NUMERIC(15,2)` / `BigDecimal`, làm tròn `RoundingMode.HALF_UP`. Không dùng float/double.
- **Thời gian:** `Instant` (UTC) ở tầng entity mới; một số chỗ legacy dùng `LocalDateTime`.
  Jackson serialize theo định dạng `dd-MM-yyyy HH:mm:ss` ở timezone `Asia/Ho_Chi_Minh` (xem `JacksonConfig`).
- **Enum:** lưu dạng STRING (`@Enumerated(EnumType.STRING)`) để bền vững khi thêm giá trị.
- **Audit:** `@CreatedDate` (Spring Data auditing) + `@UpdateTimestamp` (Hibernate). Cột `update_at` (lưu ý tên cột — đổi tên ở V14).

---

## 5. Schema & Flyway Migrations

Migration nằm ở `resources/db/migration` (chạy mọi profile) và `resources/db/devdata` (chỉ dev — mock data).
Quy ước forward-only, versioned (`V{n}__mô_tả.sql`).

| Version | Nội dung |
|---------|----------|
| V1 | Schema khởi tạo: users, roles, brands, categories, coupons, products, carts, user_roles, user_addresses, orders, product_images, cart_items, order_items, order_histories, payments, reviews, wishlists. |
| V2 | Index cho hot path. |
| V3 (devdata) | Mock data (chỉ profile dev). |
| V4–V6 | Sửa/vô hiệu hóa password user seed, set BCrypt cho dev admin. |
| V7 | **Unique index `uk_payments_transaction_no`** trên `transaction_no` (partial: WHERE NOT NULL) — nền tảng idempotency webhook. |
| V8 | Thêm `updated_at` cho core tables. |
| V9 | CHECK constraint `stock_quantity >= 0`. |
| V10 | Siết ràng buộc xóa category. |
| V11 | Bảng `shedlock` cho ShedLock. |
| V12–V13, V19 | `pg_trgm` extension + functional GIN trigram index trên `lower(name)` của products (tìm kiếm mờ). |
| V14 | Đổi tên `updated_at` → `update_at`. |
| V15 | Thêm `created_at` cho coupons. |
| V16 | CHECK constraint `rating` (1–5) trên reviews. |
| V17 | Thêm `user_id` vào order_histories. |
| V18 | Bỏ `wishlists.added_at`. |
| V20 | **Bảng `refresh_tokens`** (opaque token, FK cascade, index theo user_id). |
| V21 | **Cột `users.token_version`** (vô hiệu hóa access token tức thì). |

Cấu hình Flyway theo profile:
- **dev**: `validate-on-migrate=false`, `baseline-on-migrate=true`, `repair-on-migrate=true`,
  `clean-on-validation-error=true` (⚠️ **nguy hiểm** — tự xóa DB khi checksum lệch; chỉ tiện cho local).
- **prod**: `ddl-auto=validate`, `sql.init.mode=never` (chỉ validate cấu trúc, tuyệt đối không tự sửa bảng).

---

## 6. Bảo mật (Security)

Trung tâm an ninh: `config/SecurityConfig`. Stateless (`SessionCreationPolicy.STATELESS`),
filter `JwtFilter` chèn trước `UsernamePasswordAuthenticationFilter`.

### 6.1 Mô hình xác thực hai token

| Loại token | Bản chất | Vòng đời | Lưu ở đâu | Quản lý |
|-----------|----------|----------|-----------|---------|
| **Access token** | JWT (HMAC-SHA), stateless | mặc định 15 phút (`access-expiration=900000ms`) | Cookie `AUTH_TOKEN` (HttpOnly) hoặc header `Bearer` | `JwtService` |
| **Refresh token** | Opaque (random base64url 48 byte), lưu DB | mặc định 7 ngày (`refresh-expiration=604800000ms`) | Cookie `REFRESH_TOKEN` (HttpOnly, path `/api/v1/auth`) | `RefreshTokenService` + bảng `refresh_tokens` |

**JWT claims** (`JwtService.generateAccessToken`): `sub`=username, `userId`, `roles`, `type=access`,
`tokenVersion`, `jti` (UUID), `iat`, `exp`. Ký bằng `Keys.hmacShaKeyFor` — secret base64 ≥32 byte,
fallback hash SHA-256 nếu secret là plain-text.

### 6.2 Token versioning — vô hiệu hóa tức thì

Vấn đề cố hữu của JWT stateless là không thu hồi được trước khi hết hạn. AuraTech giải quyết bằng
`User.tokenVersion`:
- Access token mang claim `tokenVersion` tại thời điểm phát hành.
- `JwtFilter` so khớp `tokenVersion` trong token với `tokenVersion` hiện tại của user trong DB.
  **Lệch → từ chối ngay (401)** và xóa cookie nếu token đến từ cookie.
- Khi logout / đổi mật khẩu / khóa tài khoản → tăng `tokenVersion` → mọi access token cũ chết tức thì
  (lưu ý: điều này đăng xuất tất cả thiết bị của user đó).

`JwtFilter` còn kiểm tra `userDetails.isEnabled()` (= `user.isActive()`) — user bị khóa bị từ chối ngay,
không chờ token hết hạn.

### 6.3 Luồng refresh token (chống replay)

`RefreshTokenService.verifyAndRotate(rawToken)` — **rotation**: xác thực token hiện tại → revoke nó →
phát hành token mới. Token cũ dùng lại lần hai sẽ bị từ chối (đã revoked). Endpoint `POST /api/v1/auth/refresh`
đọc refresh token từ cookie, xoay vòng, trả access token + refresh token mới qua `Set-Cookie`.

Các thao tác thu hồi:
- `revoke(token)` — thu hồi 1 token.
- `revokeSessionAndBump(token)` — logout: revoke token phiên hiện tại + tăng `tokenVersion` (qua `incrementTokenVersion`).
- `revokeAllRefreshTokens(userId)` — thu hồi toàn bộ (gọi từ luồng đang có User entity managed, caller tự bump tokenVersion).

### 6.4 OAuth2 Google

`OAuth2SuccessHandler` (kế thừa `SimpleUrlAuthenticationSuccessHandler`):
1. Google xác thực → lấy `email` từ `OAuth2User`.
2. Tìm user theo email; **chỉ chấp nhận user đã đăng ký** (không auto-provision) và đang active.
3. Phát access token (JWT) + tạo refresh token, set cả hai vào cookie `Set-Cookie`.
4. Redirect về frontend (`app.oauth2.success-redirect`, mặc định `http://localhost:3000/checkout/success`).

Scope: `openid, profile, email`.

### 6.5 Phân quyền (Authorization)

- `@EnableMethodSecurity` cho phép `@PreAuthorize` ở tầng method.
- Quy tắc URL trong `SecurityConfig`:
  - Public: `OPTIONS /**`, `/api/v1/payments/vnpay-webhook`, `/error`, `/api/v1/auth/**`, `/oauth2/**`,
    `/login/oauth2/**`, `GET /uploads/**`, `GET` của products/brands/categories/reviews, Swagger UI/api-docs,
    `/actuator/health/**` + `/actuator/info`.
  - `ADMIN`: `/actuator/**` còn lại.
  - Còn lại: yêu cầu xác thực.
- Authorities mapping: `UserPrincipal` map mỗi role thành `ROLE_<tên>` (vd `ROLE_ADMIN`, `ROLE_CUSTOMER`).
- **Chống IDOR**: service luôn kiểm tra quyền sở hữu (vd `getOrderById` đối chiếu `order.user.id == principal.id`,
  ném `BusinessRuleException` nếu không khớp). `userId` lấy từ `@AuthenticationPrincipal`, không nhận từ client.

### 6.6 CSRF & CORS

- **CSRF**: bật với `CookieCsrfTokenRepository` (HttpOnly=false để JS đọc cookie `XSRF-TOKEN`), gửi kèm header `X-XSRF-TOKEN`.
  Bỏ qua CSRF cho: các endpoint auth (login/register/refresh/logout), webhook VNPay, OAuth2, và **mọi request mang `Authorization: Bearer`** (`BEARER_AUTH_REQUEST` matcher — token-based thì không cần CSRF). Endpoint `GET /api/v1/auth/csrf` cấp token cho frontend.
- **CORS**: nguồn duy nhất ở `SecurityConfig` (đã bỏ trùng lặp ở WebConfig). Allowed origins: `http://localhost:3000`,
  `https://auratech.vn`; methods GET/POST/PUT/DELETE/OPTIONS; `allowCredentials=true` (cần thiết cho cookie).

### 6.7 Cookie (`AuthCookieService`)

Sinh cookie HttpOnly cho cả access và refresh token. Thuộc tính cấu hình được:
`secure` (false ở dev, true ở prod), `sameSite` (mặc định `Strict`), path riêng cho refresh (`/api/v1/auth`
— chỉ gửi kèm cho endpoint auth, giảm bề mặt tấn công). Max-age = vòng đời token tương ứng.

### 6.8 Mật khẩu

- `BCryptPasswordEncoder`.
- Login chặn user "seed" không có hash BCrypt hợp lệ (regex `^\$2[aby]\$\d{2}\$.{53}$`) — yêu cầu đăng ký mới.

---

## 7. Luồng nghiệp vụ trọng tâm

### 7.1 Checkout / Tạo đơn hàng (`OrderServiceImpl.createOrder`)

Toàn bộ trong một transaction (`@Transactional`):
1. Kiểm tra user tồn tại và `isActive` (tài khoản bị khóa không đặt được hàng).
2. Lấy cart **có khóa** (`findByUserIdForUpdate`) — chống race; cart rỗng → lỗi.
3. Ánh xạ mỗi cart item → `OrderLineRequest` (client không tự nhập dòng hàng).
4. **Giữ kho + chốt giá** qua `InventoryService.reserveStockAndPriceLines` (xem 7.2) → trả `LineDraft`.
5. Cộng `subTotal` (HALF_UP, scale 2).
6. **Áp coupon** qua `CouponRedemptionService.redeem` (xem 7.4) → `discountAmount`, `coupon`.
7. Tính `finalAmount = max(subTotal − discount, 0)`.
8. Tạo `Order` (PENDING) + các `OrderItem` (kèm `priceAtPurchase` snapshot).
9. Ghi `OrderHistory` "Order created".
10. **Khởi tạo payment** + set `paymentExpiresAt` (`PaymentAttemptService.initializePayment`).
11. Lưu order, **dọn sạch cart** (`cart.getItems().clear()` → orphanRemoval xóa cart_items khi flush).

### 7.2 Quản lý tồn kho (`InventoryServiceImpl`) — chống overselling

- `@Transactional(propagation = MANDATORY)` — **bắt buộc** chạy trong transaction của caller (không tự mở tx mới).
- Với mỗi dòng: **trừ kho atomic** bằng UPDATE có điều kiện:
  ```sql
  UPDATE Product SET stockQuantity = stockQuantity - :qty
  WHERE id = :id AND stockQuantity >= :qty
  ```
  Nếu `rowsAffected == 0` → `InsufficientStockException` (không đủ hàng hoặc sản phẩm không tồn tại).
- Cách này **không cần lock bi quan dài**: điều kiện `>= :qty` trong câu UPDATE đảm bảo nguyên tử ở tầng DB,
  ngăn hai đơn cùng lúc bán quá số lượng. Kết hợp CHECK constraint `stock_quantity >= 0` (V9) làm lưới an toàn.
- Sau khi trừ thành công mới load product để lấy giá (`PricingService.sellingPrice`).

### 7.3 Định giá (`PricingServiceImpl`)

Đơn giản và tập trung: giá bán = `discountPrice` nếu có, ngược lại `basePrice`. Giá được **chốt vào `OrderItem.priceAtPurchase`**
tại thời điểm mua nên thay đổi giá sau này không ảnh hưởng đơn cũ.

### 7.4 Áp coupon (`CouponRedemptionServiceImpl`)

- `@Transactional(propagation = MANDATORY)`.
- Coupon code rỗng → `CouponRedemptionResult.empty()` (không giảm).
- Lấy coupon **có khóa** (`findByCodeForUpdate`) — chống double-spend khi nhiều đơn dùng cùng coupon.
- Validate qua domain method: hết hạn / hết lượt / chưa đạt min order → `BusinessRuleException`.
- Tính `discountAmount` (`calculateDiscount`) và **tăng `usedCount`**.

### 7.5 Vòng đời đơn hàng (`OrderStateMachineImpl`) — State Machine

Trạng thái: `PENDING → CONFIRMED → SHIPPED → DELIVERED`, và `CANCELLED` (nhánh hủy).

Ma trận chuyển trạng thái hợp lệ (`validateTransition`):
- `PENDING → CONFIRMED`, `CONFIRMED → SHIPPED`, `SHIPPED → DELIVERED`.
- Hủy (`→ CANCELLED`) chỉ khi đang `PENDING` hoặc `CONFIRMED`.
- `CANCELLED` và `DELIVERED` là trạng thái cuối — không chuyển tiếp.
- `→ SHIPPED` **bắt buộc** có `trackingNumber`.
- Mọi chuyển trạng thái ghi `OrderHistory` (audit). Cập nhật dùng `findWithItemsByIdForUpdate` (khóa bi quan).

### 7.6 Tách side-effect (`OrderLifecycleService`)

`@Transactional(propagation = MANDATORY)` — chứa logic chuyển trạng thái **kèm side-effect**, được gọi từ
payment flow và webhook (không set `order.status` trực tiếp ở các chỗ đó):
- `confirmAfterSuccessfulPayment(order)` — chuyển sang CONFIRMED, xóa `paymentExpiresAt`, ghi history.
  Idempotent: nếu đã CONFIRMED chỉ xóa hạn; chặn nếu đã CANCELLED/SHIPPED/DELIVERED.
- `cancelOrder(order, lý do)` — **hoàn kho** (cộng lại `stockQuantity`, có khóa product) + **hoàn lượt coupon**
  (giảm `usedCount`, có khóa coupon) + set CANCELLED + ghi history. Idempotent với CANCELLED; chặn nếu đã SHIPPED/DELIVERED.

### 7.7 Thanh toán (`PaymentServiceImpl`, `PaymentAttemptServiceImpl`)

- **Khởi tạo** (`initializePayment`): tạo Payment PENDING khi tạo order; set `paymentExpiresAt` = now + 15 phút
  (riêng **COD → null**, không hết hạn).
- **Tạo payment** (`createPayment`): khóa order, kiểm tra quyền sở hữu + order còn nhận thanh toán được.
  **Idempotent**: nếu payment gần nhất SUCCESS → chặn; nếu PENDING → trả lại chính nó (cập nhật provider nếu đổi);
  nếu FAILED → cho tạo attempt mới.
- **Cập nhật payment** (`updatePayment`): chỉ xử lý khi payment đang PENDING; SUCCESS → `confirmAfterSuccessfulPayment`,
  FAILED → `cancelOrder`. Đối chiếu `orderId` khớp.
- **Retry** (`retryPayment`): chỉ khi đơn chưa CANCELLED/DELIVERED, đúng chủ đơn, và lần thanh toán gần nhất FAILED →
  tạo Payment PENDING mới cùng provider.
- `ensureOrderCanAcceptPayment`: nếu quá `paymentExpiresAt` → tự `cancelOrder("Payment window expired")` rồi báo lỗi.

### 7.8 Webhook VNPay (`PaymentWebhookServiceImpl`) — Production-grade IPN

Endpoint public `GET/POST /api/v1/payments/vnpay-webhook` (`PaymentWebhookController`), không cần auth cookie/JWT —
**bảo mật bằng chữ ký HMAC** ở tầng service. Bốn nguyên tắc:

1. **Validate signature TRƯỚC khi mở transaction DB**: sort params alphabet, nối `key=value&`, HMAC-SHA512 với secret,
   so khớp `vnp_SecureHash` (case-insensitive). Sai/thiếu → `INVALID_SIGNATURE` (403), không chạm DB.
2. **Idempotency hai tầng**:
   - State check: tìm theo `gateway_transaction_no` (`vnp_TransactionNo`); nếu payment đã SUCCESS → trả 200 idempotent.
   - Unique key DB: index `uk_payments_transaction_no` (V7) chặn race; bắt `DataIntegrityViolationException` → trả 200.
3. **Đối soát số tiền**: `vnp_Amount` (đơn vị xu = VND×100) phải khớp `order.finalAmount × 100`. Lệch → log `[ALERT]` + `AMOUNT_MISMATCH` (400), **từ chối** cập nhật.
4. **Không set order.status trực tiếp**: gọi `OrderLifecycleService` (`vnp_ResponseCode == "00"` → SUCCESS → confirm; ngược lại FAILED → cancel + hoàn kho/coupon). Lưu `gateway_transaction_no` để đối soát.

Mapping kết quả → HTTP (body JSON `{"RspCode","Message"}` chuẩn VNPay):
PROCESSED/IDEMPOTENT → 200, INVALID_SIGNATURE → 403, AMOUNT_MISMATCH → 400, ORDER_NOT_FOUND → 404.

### 7.9 Hết hạn đơn tự động (Scheduled + ShedLock)

`OrderStateMachineImpl.expirePendingOrders()`:
- `@Scheduled(fixedDelayString = "${auratech.order-expiration.fixed-delay-ms:60000}")` — chạy mỗi 60s.
- Tìm các đơn PENDING đã quá `paymentExpiresAt` (`findExpiredOrdersForUpdate`, khóa) → `cancelOrder("Payment window expired")`.
- **ShedLock** (`@EnableSchedulerLock`, `JdbcTemplateLockProvider`, bảng `shedlock`, lock tối đa 30 phút) đảm bảo
  chỉ một instance chạy job khi deploy nhiều bản (chống xử lý trùng).

---

## 8. Caching (Redis)

- `@EnableCaching` + Redis làm cache provider (`spring.cache.type=redis` ở dev, TTL mặc định 600s).
- Read: `@Cacheable` với key tường minh (vd `'user:' + #userId + ':order:' + #orderId`, `'all:' + page + size`).
- Write: `@Caching(evict = {...})` — hiện đang **evict `allEntries=true`** trên nhiều cache (orders, products,
  coupons, payments...) ở mọi thao tác ghi.

> ⚠️ **Hạn chế đã biết**: chiến lược `allEntries=true` blanket làm hit-rate thấp. Backlog (#19 trong
> `BACKEND_UPGRADE_PLAN.md`) đề xuất evict theo key cụ thể + JSON serializer + TTL per-cache.

---

## 9. Xử lý lỗi (`GlobalExceptionHandler`)

`@RestControllerAdvice` trả `ErrorResponse` thống nhất (`timestamp, status, error, message`):

| Exception | HTTP | Ghi chú |
|-----------|------|---------|
| `ResourceNotFoundException` | 404 | Không tìm thấy tài nguyên |
| `MethodArgumentNotValidException` / `ConstraintViolationException` | 400 | Gộp message lỗi validation |
| `BusinessRuleException` | 400 | Vi phạm luật nghiệp vụ |
| `UsernameNotFoundException` / `BadCredentialsException` | 401 | "Username hoặc password không đúng" (không lộ chi tiết) |
| `AccessDeniedException` | 403 | Không đủ quyền |
| `DataIntegrityViolationException` | 409 | Map theo SQLState: 23505 unique (dò email/username), 23503 FK, 23502 not-null, 23514 check |
| `Exception` (fallback) | 500 | Log full stacktrace, trả message chung chung |

`access-denied`/CSRF lỗi còn được xử lý trực tiếp trong `SecurityConfig` (trả `ErrorResponse` JSON 403).

---

## 10. Cấu hình & Profiles

- **`application.properties`** (chung): datasource từ env, JPA `open-in-view=false`, JWT secret/expiration,
  OAuth2 Google, cookie, upload (max file 5MB / request 20MB), Redis, Actuator (expose `health,info,metrics,prometheus`;
  health show-details `when_authorized`; readiness gồm db+redis).
- **`application-dev.properties`**: `ddl-auto=validate`, show-sql, Flyway gồm cả `db/devdata`, cache Redis,
  VNPay secret dev, JWT secret dev fallback. ⚠️ `clean-on-validation-error=true`.
- **`application-prod.properties`**: `ddl-auto=validate`, không show-sql, `sql.init.mode=never`, cookie `secure=true`.

**Biến môi trường quan trọng**: `JWT_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `VNPAY_SECRET_KEY`, `DB_*`,
`AUTH_COOKIE_*`, `OAUTH2_SUCCESS_REDIRECT`, `UPLOAD_ROOT`, `SPRING_PROFILES_ACTIVE`.

---

## 11. Triển khai (Deployment)

**Dockerfile** (multi-stage):
- Build stage: `eclipse-temurin:21-jdk-alpine` + Maven → `mvn package -DskipTests` → `aura-tech.jar`.
- Runtime stage: `eclipse-temurin:21-jre-alpine`, tạo user non-root `auratech`, volume `/app/uploads`,
  `ENTRYPOINT java -XX:MaxRAMPercentage=75 -jar`.

**docker-compose.yml** — 3 service trên network bridge `s-network`:
- `app` (port 8080): build từ Dockerfile, env từ `.env`, `depends_on` postgres+redis healthy,
  volume `uploads-data`, healthcheck `wget /actuator/health/liveness`.
- `postgres` (postgres:17-alpine, port 5432): volume `postgres-data`, healthcheck `pg_isready`.
- `redis` (redis:alpine, port 6379): healthcheck `redis-cli ping`.

**Static/uploads**: `WebConfig` map `/uploads/**` → thư mục `app.upload.root` (mặc định `uploads`).

---

## 12. API Surface (tổng quan)

Prefix chung: `/api/v1`. Phân nhóm:

**Auth** (`/api/v1/auth`): `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /csrf`.

**User API** (`controller/user`, yêu cầu đăng nhập trừ GET catalog công khai):
`orders`, `cart`, `products`, `product-images`, `categories`, `brands`, `coupons`, `payments`,
`payments/vnpay-webhook` (public), `reviews`, `wishlist`, `user`, `user-addresses`, `order-histories`.
Ví dụ `OrderController`: `GET /orders/{id}`, `GET /orders/user`, `POST /orders`, `POST /orders/{id}/payments/retry`.

**Admin API** (`controller/admin`, yêu cầu ADMIN): `AdminBrand/Category/Coupon/Order/OrderHistory/OrderItem/
Payment/Product/ProductImage/Review/UserAddress/User` — CRUD quản trị các tài nguyên tương ứng.

**Hạ tầng**: Swagger UI (`/swagger-ui.html`, `/v3/api-docs`), Actuator (`/actuator/health/**`, `/info` public;
phần còn lại ADMIN).

Phân trang: mặc định page size 12, **tối đa 50** (`WebConfig.customizePageable`). Trailing slash được chuẩn hóa
bởi `UrlHandlerFilter`.

---

## 13. Điểm thiết kế nổi bật & rủi ro đã biết

**Điểm mạnh:**
- Trừ kho atomic chống overselling; coupon redeem có khóa chống double-spend.
- Order state machine tường minh + tách side-effect qua `OrderLifecycleService` (propagation MANDATORY).
- Webhook VNPay chuẩn production: verify HMAC trước, idempotency 2 tầng (state + unique key), đối soát số tiền.
- Auth hai token + `tokenVersion` cho phép thu hồi tức thì — khắc phục nhược điểm JWT stateless.
- ShedLock cho scheduled job an toàn khi multi-instance.
- Flyway versioned, tiền tệ `NUMERIC`/`BigDecimal`, enum dạng STRING.

**Rủi ro / nợ kỹ thuật** (chi tiết & lộ trình ở `BACKEND_UPGRADE_PLAN.md`):
- Cache `allEntries=true` blanket → hit-rate thấp.
- `clean-on-validation-error=true` ở dev = nguy cơ xóa DB; cần khóa cứng, tuyệt đối cấm prod.
- Secret fallback từng nằm trong repo (docker-compose / properties dev) — cần secret manager + rotate.
- Chưa có rate limiting/lockout cho login (brute-force).
- Hard-delete user có thể vi phạm FK — nên chuyển soft-delete.
- API chưa auth có thể bị redirect 302 sang OAuth thay vì 401 JSON (cần `AuthenticationEntryPoint` cho REST).
- `src/test` còn rỗng — thiếu lưới an toàn (unit/integration/concurrency).
- Mâu thuẫn PUT vs PATCH ở các `update*` (request `@NotNull` nhưng service xử lý "if != null").

---

> Tài liệu này phản ánh codebase tại thời điểm cập nhật. Khi thay đổi kiến trúc/luồng nghiệp vụ,
> hãy cập nhật mục liên quan để giữ vai trò "single source of truth".
