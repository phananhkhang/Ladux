# Ladux Backend — Tài Liệu Kiến Trúc & Tri Thức Hệ Thống Toàn Diện

> **Đơn vị phát triển:** Ladux Engineering Team  
> **Mục đích tài liệu:** Đây là nguồn tham chiếu kỹ thuật duy nhất (Single Source of Truth) mô tả chính xác 100% hiện trạng kiến trúc, mô hình dữ liệu, luồng nghiệp vụ, cơ chế bảo mật, vận hành và hướng phát triển của codebase `backend/`.  
> **Phương pháp xây dựng:** Tài liệu được tổng hợp từ việc đọc và phân tích trực tiếp từng lớp mã nguồn (`Controller`, `Service`, `Repository`, `Model`, `Config`, `Exception`, `Migration`, `Docker`, `Test`).  
> **Cập nhật lần cuối:** 2026-07-31 · **Phạm vi:** Toàn bộ `backend/src/main` + 29 Flyway Migrations (V1–V30) + Test Suites.

---

## MỤC LỤC TOÀN DIỆN

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Technology Stack & Cấu Hình Môi Trường](#2-technology-stack--cấu-hình-môi-trường)
3. [Kiến Trúc Phân Lớp & Cấu Trúc Package Chi Tiết](#3-kiến-trúc-phân-lớp--cấu-trúc-package-chi-tiết)
4. [Mô Hình Dữ Liệu (Domain Model & ERD)](#4-mô-hình-dữ-liệu-domain-model--erd)
5. [Bảo Mật & Phân Quyền (Security & Authentication)](#5-bảo-mật--phân-quyền-security--authentication)
6. [Luồng Checkout 9 Bước Chi Tiết (Checkout Flow)](#6-luồng-checkout-9-bước-chi-tiết-checkout-flow)
7. [Order State Machine & Lifecycle Management](#7-order-state-machine--lifecycle-management)
8. [Thanh Toán VNPay & Webhook Production-Grade](#8-thanh-toán-vnpay--webhook-production-grade)
9. [Quản Lý Chuỗi Cung Ứng (Supply Chain & Procurement)](#9-quản-lý-chuỗi-cung-ứng-supply-chain--procurement)
10. [Sổ Cái Tồn Kho (Inventory Ledger Pattern)](#10-sổ-cái-tồn-kho-inventory-ledger-pattern)
11. [Chiến Lược Cache & Performance Tuning (Redis)](#11-chiến-lược-cache--performance-tuning-redis)
12. [Xử Lý Lỗi Thống Nhất (Global Exception Handling)](#12-xử-lý-lỗi-thống-nhất-global-exception-handling)
13. [Scheduled Jobs & Distributed Locking (ShedLock)](#13-scheduled-jobs--distributed-locking-shedlock)
14. [API Surface & Endpoint Reference Chi Tiết](#14-api-surface--endpoint-reference-chi-tiết)
15. [DB Migration & Schema Versioning (Flyway)](#15-db-migration--schema-versioning-flyway)
16. [Đóng Gói, Triển Khai & Cấu Hình Hệ Thống](#16-đóng-gói-triển-khai--cấu-hình-hệ-thống)
17. [Đánh Giá Kiến Trúc, Nợ Kỹ Thuật & Lộ Trình Phát Triển](#17-đánh-giá-kiến-trúc-nợ-kỹ-thuật--lộ-trình-phát-triển)

---

## 1. Tổng Quan Hệ Thống

Ladux Backend là nền tảng **thương mại điện tử B2C** dành cho thiết bị công nghệ (laptop, phụ kiện) tích hợp **hệ thống quản lý chuỗi cung ứng & mua hàng (Procurement & Supply Chain Management)**.

Hệ thống được xây dựng theo phong cách kiến trúc **Modular Monolith** phân lớp truyền thống (`Controller` -> `Service` -> `Repository` -> `Database`), chú trọng cao độ vào **tính an toàn dữ liệu** (data integrity), **tính toàn vẹn giao dịch** (ACID transactions), **chống overselling** (bán quá tồn kho) và **dấu vết kiểm toán bất biến** (immutable audit log).

### 1.1 Phân Loại Đối Tượng Người Dùng

1. **Khách hàng (CUSTOMER):**
   - Tìm kiếm, lọc sản phẩm theo Thương hiệu (Brand), Danh mục (Category), Màu sắc (Color), Biến thể (ProductVariant).
   - Quản lý Giỏ hàng (Cart), Địa chỉ nhận hàng (UserAddress), Danh sách yêu thích (Wishlist).
   - Đặt hàng (Checkout) với mã giảm giá (Coupon), thanh toán qua VNPay IPN hoặc COD.
   - Đánh giá sản phẩm (Review - giới hạn 1 đánh giá/user/sản phẩm), theo dõi Lịch sử đơn hàng (OrderHistory).
   - Quản lý tài khoản, thăng cấp thành viên (CustomerLevel: BROWSER -> SILVER -> GOLD -> RUBY).

2. **Quản trị viên (ADMIN):**
   - Quản lý danh mục Catalog: Thương hiệu, Danh mục (cây phân cấp self-referencing), Sản phẩm, Biến thể, Màu sắc, Ảnh sản phẩm.
   - Quản lý Khuyến mãi (Coupon) với quy tắc giảm giá linh hoạt (FIXED / PERCENT, minOrderValue, usageLimit).
   - Quản lý Đơn hàng (Order State Machine): Duyệt, giao hàng (SHIPPED với tracking number), hoàn tất (DELIVERED), xử lý trả hàng (RETURNED) và hoàn tiền (REFUNDED).
   - Quản lý Khách hàng (CRM): xem chi tiết điểm thưởng (loyaltyPoints), tổng chi tiêu (totalSpent), cấp độ thành viên.
   - Quản lý Chuỗi cung ứng (Procurement): Nhà cung cấp (Supplier), Giá nhập & Lead time (ProductSupplier), Đơn mua hàng (PurchaseOrder) với luồng nhận hàng từng phần (partial receiving).
   - Quản lý Kho hàng (StockMovement): Điều chỉnh tồn kho thủ công (Adjustment), theo dõi sổ cái biến động kho bất biến.
   - Quản lý người dùng, phân quyền, xem nhật ký thanh toán và thống kê hệ thống.

### 1.2 Điểm Vào Hệ Thống (Entry Point)

Lớp khởi chạy chính là class `org.akira.ladux.LaduxApplication`:
- `@SpringBootApplication`: Khởi tạo Spring Boot context.
- `@EnableJpaAuditing`: Tự động điền thông tin ngày tạo/ngày cập nhật (`createdAt`, `updatedAt`).
- `@EnableScheduling`: Kích hoạt bộ lập lịch công việc định kỳ (`@Scheduled`).
- `@EnableCaching`: Kích hoạt cơ chế lưu trữ tạm bộ nhớ đệm Spring Cache (`@Cacheable`, `@CacheEvict`).

---

## 2. Technology Stack & Cấu Hình Môi Trường

### 2.1 Bảng Công Nghệ Sử Dụng

| Lớp Kiến Trúc | Công Nghệ / Thư Viện | Phiên Bản | Vai Trò & Ghi Chú |
|---------------|----------------------|-----------|-------------------|
| **Ngôn ngữ** | Java (JDK) | 21 LTS | Sử dụng Records, Pattern Matching, Sealed Types, Sealed Interfaces |
| **Framework** | Spring Boot | 4.0.6 | Spring Boot 4, Spring Web MVC, Spring Data JPA, Spring Security |
| **Persistence** | Hibernate / JPA | Boot Default | `open-in-view=false`, `@EntityGraph`, Pessimistic Locking, Custom Queries |
| **Database** | PostgreSQL | 17-alpine | Chạy Docker container, ràng buộc CHECK constraint, chỉ mục GIN Trigram |
| **Migration** | Flyway | Boot Default | Quản lý versioned schema V1–V30+, migration forward-only |
| **Cache & Session** | Spring Cache + Redis | Boot Default | `@EnableCaching`, `RedisCacheManager`, mặc định TTL 10 phút |
| **Rate Limit** | Bucket4j (bucket4j-redis) | 8.14.0 | Giới hạn tần suất gọi API đăng nhập phân tán qua Redis |
| **Security** | Spring Security | 6.x | Stateless JWT, Custom Filter Chain, CSRF Cookie, OAuth2 Client |
| **JWT Library** | jjwt (io.jsonwebtoken) | 0.13.0 | Tạo & giải mã Access Token (15 phút), chứa claims `userId`, `roles`, `tokenVersion` |
| **Distributed Lock** | ShedLock | 7.7.0 | `shedlock-provider-jdbc-template`, khóa tác vụ `@Scheduled` giữa nhiều instance |
| **Validation** | Jakarta Bean Validation | Boot Default | Ràng buộc dữ liệu đầu vào `@Valid` tại Controller layer |
| **JSON Parser** | Jackson Databind | 2.21.2 | Custom Formatter `Instant` & `LocalDateTime` (`dd-MM-yyyy HH:mm:ss`, Múi giờ VN) |
| **Mã Hóa VNPay** | Commons Codec | 1.22.0 | Tính toán HMAC-SHA512 checksum cho thanh toán VNPay |
| **Tài Liệu API** | Springdoc OpenAPI | 3.0.3 | Tự động tạo Swagger UI (`/swagger-ui.html`) và OpenAPI JSON specs |
| **Observability** | Spring Boot Actuator | Boot Default | Probes `health/liveness`, `health/readiness`, `/actuator/prometheus` |
| **Build Tool** | Apache Maven | 3.9+ | Đóng gói JAR (`finalName=ladux`), Lombok annotation processing |

### 2.2 Biến Môi Trường Key-Value Phổ Biến

```properties
# BẢO MẬT & JWT
JWT_SECRET=your-256-bit-secret-key-here...
app.jwt.access-expiration=900000          # 15 phút (ms)
app.jwt.refresh-expiration=604800000      # 7 ngày (ms)

# CỔNG THANH TOÁN VNPAY
VNPAY_SECRET_KEY=vnpay-hash-secret...
VNPAY_TMN_CODE=DEMO...
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/checkout/success

# CƠ SỞ DỮ LIỆU POSTGRESQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ladux_db
DB_USERNAME=ladux_user
DB_PASSWORD=ladux_password

# BỘ NHỚ ĐỆM REDIS
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# RATE LIMITING
app.rate-limit.login.capacity=5           # 5 lần thử
app.rate-limit.login.refill-minutes=1     # Nạp lại sau 1 phút

# SCHEDULER & LƯU TRỮ
ladux.order-expiration.fixed-delay-ms=60000 # Quét đơn hết hạn mỗi 60 giây
UPLOAD_ROOT=C:/ladux/uploads               # Thư mục chứa ảnh tải lên
```

---

## 3. Kiến Trúc Phân Lớp & Cấu Trúc Package Chi Tiết

### 3.1 Luồng Xử Lý HTTP Request Chuẩn (Request Lifecycle)

```
                       HTTP Request từ Client (Browser / Mobile / Postman)
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 1. LoginRateLimitFilter (@Order HIGHEST_PRECEDENCE)                      │
 │    - Đỉnh mức: Chỉ lọc trên endpoint `POST /api/v1/auth/login`          │
 │    - Bucket4j + Redis (Key: login-rate-limit:{IP})                       │
 │    - Nếu vượt quá ( > 5 req/phút) -> Trả ngay HTTP 429 Too Many Requests  │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │ (Chưa vượt limit)
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 2. Spring Security Filter Chain (UrlHandlerFilter / CORS / CSRF)         │
 │    - CORS Filter: Cấu hình Whitelist origins (localhost, ladux.vn...)    │
 │    - CSRF Filter: CookieCsrfTokenRepository (Ignore `/api/v1/**`)         │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 3. JwtFilter (OncePerRequestFilter - đứng trước UsernamePasswordAuth)    │
 │    - Bốc tách Token từ Cookie `AUTH_TOKEN` hoặc Header `Bearer ...`      │
 │    - Đọc `username` & `tokenVersion` từ JWT Claim                         │
 │    - Tải UserDetails -> Kiểm tra `isEnabled()` và so sánh `tokenVersion`│
 │    - Nếu hợp lệ -> Đưa `UsernamePasswordAuthenticationToken` vào Context│
 └──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 4. Spring Security Authorization Rule Evaluation                         │
 │    - Public Paths (permitAll): `/api/v1/auth/**`, GET products/brands...  │
 │    - Admin Paths (hasRole 'ADMIN'): `/api/v1/admin/**`, `/actuator/**`   │
 │    - Authenticated Paths: Tất cả các API còn lại                         │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │ (Đã được cấp quyền)
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 5. Controller Layer (User / Admin Controller)                            │
 │    - Controller cực mỏng: Không chứa logic nghiệp vụ.                   │
 │    - Lấy thông tin user an toàn qua `@AuthenticationPrincipal`          │
 │    - Validate DTO `@Valid` -> Gọi Service -> Trả về `ResponseEntity`    │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 6. Service Layer (Interface & ServiceImpl)                               │
 │    - Thực thi Business Rules, State Transition, Validation Logic.        │
 │    - Transaction Boundary (`@Transactional` REQUIRED / MANDATORY).        │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 7. Repository Layer (Spring Data JPA)                                    │
 │    - Tương tác Cơ sở dữ liệu: JPQL, Native Query, Atomic UPDATE, Lock    │
 └──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 8. Database & Cache Layer                                                │
 │    - PostgreSQL 17 (Source of Truth) + Redis (Session/Cache/RateLimit)  │
 └──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Thống Kê Cấu Trúc Package Thực Tế (`org.akira.ladux`)

#### 1. Package `config` (8 classes)
- `SecurityConfig.java`: Cấu hình SecurityFilterChain, CORS, CSRF, PasswordEncoder (BCrypt), OAuth2 Login, AccessDeniedHandler.
- `JwtFilter.java`: Filter xác thực JWT token từ cookie/header trên từng HTTP request.
- `LoginRateLimitFilter.java`: Filter rate-limit IP cho endpoint đăng nhập (Bucket4j + Redis).
- `RateLimitConfig.java`: Khởi tạo Bean RedisClient và LettuceBasedProxyManager cho Bucket4j.
- `OAuth2SuccessHandler.java`: Xử lý sau khi Google OAuth2 xác thực thành công -> Cấp JWT & set Cookie -> Redirect.
- `JacksonConfig.java`: Cấu hình custom JSON Formatter cho Java Time API (`dd-MM-yyyy HH:mm:ss`).
- `ShedLockConfig.java`: Cấu hình ShedLock sử dụng Spring JdbcTemplate.
- `WebConfig.java`: Cấu hình Web MVC (Trailing slash, tĩnh tài nguyên `/uploads/**`).

#### 2. Package `controller` (35 controllers)
- **`user/` (15 controllers Customer-facing):** `AuthController`, `OrderController`, `CartController`, `ProductController`, `PaymentController`, `PaymentWebhookController`, `ReviewController`, `WishlistController`, `UserController`, `UserAddressController`, `NotificationController`, `OrderHistoryController`, `BrandController`, `CategoryController`, `ProductImageController`.
- **`admin/` (20 controllers Admin-only):** `AdminOrderController`, `AdminProductController`, `AdminProductVariantController`, `AdminProductImageController`, `AdminBrandController`, `AdminCategoryController`, `AdminColorController`, `AdminCouponController`, `AdminCustomerController`, `AdminSupplierController`, `AdminProductSupplierController`, `AdminPurchaseOrderController`, `AdminStockMovementController`, `AdminPaymentController`, `AdminUserController`, `AdminReviewController`, `AdminUserAddressController`, `AdminNotificationController`, `AdminOrderHistoryController`, `AdminOrderItemController`.

#### 3. Package `model` (28 domain entities & records)
- `User.java`, `Customer.java` (Shared PK `@MapsId`), `Role.java`, `UserAddress.java`, `RefreshToken.java`, `UserPrincipal.java`.
- `Product.java`, `ProductVariant.java`, `Color.java`, `Brand.java`, `Category.java`, `ProductImage.java`, `Review.java`, `Wishlist.java`.
- `Order.java`, `OrderItem.java`, `OrderHistory.java`, `ShippingAddress.java` (`@Embeddable`), `Payment.java`, `Coupon.java`.
- `Supplier.java`, `ProductSupplier.java`, `PurchaseOrder.java`, `PurchaseOrderItem.java`, `StockMovement.java`, `Notification.java`.
- **`enums/` (11 enums):** `OrderStatus`, `PurchaseOrderStatus`, `StockMovementType`, `StockReferenceType`, `PaymentProvider`, `PaymentStatus`, `DiscountType`, `CustomerLevel`, `RoleName`, `NotificationType`, `NotificationTargetType`.

#### 4. Package `repository` (26 Spring Data Repositories)
- `UserRepository`, `CustomerRepository`, `RoleRepository`, `RefreshTokenRepository`, `UserAddressRepository`.
- `ProductRepository`, `ProductVariantRepository`, `ColorRepository`, `BrandRepository`, `CategoryRepository`, `ProductImageRepository`, `ReviewRepository`, `WishlistRepository`.
- `OrderRepository`, `OrderItemRepository`, `OrderHistoryRepository`, `PaymentRepository`, `CouponRepository`, `CartRepository`, `CartItemRepository`.
- `SupplierRepository`, `ProductSupplierRepository`, `PurchaseOrderRepository`, `PurchaseOrderItemRepository`, `StockMovementRepository`, `NotificationRepository`.

#### 5. Package `service` & `service/impl` (29 Services & ServiceImpls)
- Core ordering: `OrderServiceImpl`, `OrderLifecycleService`, `OrderStateMachineImpl`, `InventoryServiceImpl`, `CouponRedemptionServiceImpl`, `PaymentServiceImpl`, `PaymentAttemptServiceImpl`, `PaymentWebhookServiceImpl`.
- Procurement & Stock: `PurchaseOrderServiceImpl`, `StockMovementServiceImpl`, `SupplierServiceImpl`, `ProductSupplierServiceImpl`.
- Catalog & User: `ProductServiceImpl`, `ProductVariantServiceImpl`, `CustomerServiceImpl`, `UserServiceImpl`, `RefreshTokenService`, `CouponServiceImpl`, `CartServiceImpl`, `ReviewServiceImpl`, `UserAddressServiceImpl`, `CategoryServiceImpl`, `BrandServiceImpl`, `ColorServiceImpl`, `ProductImageServiceImpl`, `OrderHistoryServiceImpl`, `OrderItemServiceImpl`, `NotificationServiceImpl`, `FileStorageServiceImpl`, `PricingServiceImpl`.

---

## 4. Mô Hình Dữ Liệu (Domain Model & ERD)

### 4.1 Sơ Đồ Quan Hệ ERD Logic Chi Tiết

```
┌──────────────┐ 1          1 ┌────────────────┐
│     User     ├──────────────┤    Customer    │ (Shared PK: customer.id = user.id)
│(Authentication)              │  (CRM Profile) │
└──────┬───────┘              └────────────────┘
       │ 1
       │
       ├───────────* ┌────────────────┐ *          1 ┌────────────────┐
       │             │     Order      ├──────────────┤     Coupon     │ (Mã giảm giá)
       │             └───────┬────────┘              └────────────────┘
       │                     │ 1
       │                     ├───* ┌────────────────┐ *      1 ┌────────────────┐
       │                     │     │   OrderItem    ├──────────┤ ProductVariant │
       │                     │     └────────────────┘          └───────┬────────┘
       │                     ├───* ┌────────────────┐                  │ *
       │                     │     │  OrderHistory  │                  │
       │                     │     └────────────────┘                  │ 1
       │                     └───* ┌────────────────┐                  ┌───┴────────────┐
       │                           │    Payment     │                  │    Product     │
       │                           └────────────────┘                  └───────┬────────┘
       │ 1                                                                     │ 1
       ├───────────1 ┌────────────────┐ *          1                           │
       │             │      Cart      ├──────────────┼─────────────────────────┤
       │             └────────────────┘              │                         │
       │ 1                                           │                         ├───* ┌──────────────┐
       ├───────────* ┌────────────────┐              │                         │     │ ProductImage │
       │             │  RefreshToken  │              │                         │     └──────────────┘
       │             └────────────────┘              │                         ├───* ┌──────────────┐
       │ 1                                           │                         │     │    Review    │ (Unique user+product)
       ├───────────* ┌────────────────┐              │                         │     └──────────────┘
       │             │  UserAddress   │              │                         └───* ┌──────────────┐
       │             └────────────────┘              │                               │   Wishlist   │
       │                                             │                               └──────────────┘
       │ *                                           │
 ┌─────┴───────┐ M                                   │
 │    Role     │                                     │
 └─────────────┘                                     │
                                                     │
 # MÃ NGUỒN CHUỖI CUNG ỨNG (SUPPLY CHAIN - V22+)    │
 ┌─────────────┐ 1          * ┌─────────────────┐ * │
 │  Supplier   ├──────────────┤ ProductSupplier ├────┘ (Giá nhập costPrice + Lead time)
 └──────┬──────┘              └─────────────────┘
        │ 1
        │ *
 ┌──────┴──────┐ 1          * ┌─────────────────┐ *          1 ┌────────────────┐
 │PurchaseOrder├──────────────┤PurchaseOrderItem├──────────────┤ ProductVariant │
 └─────────────┘              └─────────────────┘              └───────┬────────┘
                                                                       │ 1
                                                                       │ * (Immutable Ledger)
                                                               ┌───────┴────────┐
                                                               │ StockMovement  │
                                                               └────────────────┘
```

### 4.2 Các Điểm Đặc Sắc Trong Thiết Kế Domain Entity

#### 1. Mẫu Thiết Kế Shared Primary Key (`Customer` <-> `User`)
- Bảng `users` chỉ quản lý các thuộc tính bảo mật và tài khoản (`email`, `username`, `password`, `isActive`, `tokenVersion`, `roles`).
- Bảng `customers` sử dụng annotation `@MapsId` của JPA để chia sẻ chung khóa chính `id = user_id`. Chứa các thuộc tính CRM (`fullName`, `phone`, `avatarUrl`, `loyaltyPoints`, `level`, `totalSpent`).
- **Lợi ích:** Tách biệt tuyệt đối giữa miền Bảo mật (Authentication) và miền Nghiệp vụ CRM, giúp hệ thống phì đại entity sạch sẽ, tối ưu query và tuân thủ nguyên tắc Single Responsibility Principle (SRP).

#### 2. Ảnh Chụp Giá Bất Biến (`OrderItem.priceAtPurchase`)
- Khi người dùng mua hàng, giá bán tại thời điểm đó (`sellingPrice`) được ghi đứt đoạn vào cột `OrderItem.priceAtPurchase`.
- Ngay cả khi giá sản phẩm (`ProductVariant.price` hoặc `discountPrice`) thay đổi trong tương lai, giá trị đơn hàng quá khứ vẫn chính xác 100%.

#### 3. Sổ Cái Biến Động Kho Bất Biến (`StockMovement`)
- Entity `StockMovement` hoạt động như một sổ cái kế toán (Ledger). Mỗi biến động xuất/nhập kho (mua hàng, hủy đơn, nhập PO, trả hàng, kiểm kê) đều được ghi vào bảng này.
- Các cột quan trọng: `quantity` (số lượng có dấu +/-), `movementType` (enum 7 loại), `referenceType` (enum 5 loại), `referenceId` (ID của Order/PO), `createdBy` (User thực hiện).
- **Nguyên tắc:** Dữ liệu trong `StockMovement` **chỉ được INSERT, không bao giờ được UPDATE hoặc DELETE**.

#### 4. Rich Domain Pattern ở Entity `Coupon`
- Entity `Coupon` không chỉ là Data Holder (Anemic Domain) mà chứa trực tiếp Business Rules:
  - `calculateDiscount(BigDecimal subTotal)`: Tính giá trị giảm theo `FIXED` hoặc `PERCENT`.
  - `isExpired()`: Kiểm tra thời hạn `expiresAt`.
  - `isUsageLimitReached()`: Kiểm tra giới hạn lượt dùng `usedCount >= usageLimit`.
  - `isBelowMinOrderValue(BigDecimal subTotal)`: Kiểm tra đơn hàng đạt giá trị tối thiểu.

---

## 5. Bảo Mật & Phân Quyền (Security & Authentication)

### 5.1 Cơ Cơ Dual Token Strategy (Access JWT + Refresh Opaque)

Hệ thống sử dụng cơ chế Xác thực 2 Layer Token kết hợp giữa JWT và Opaque Token trong HttpOnly Cookie:

```
──────────────────────────────────────────────────────────────────────────────────────────
ĐẶC TÍNH                 ACCESS TOKEN (JWT)                 REFRESH TOKEN (OPAQUE)
──────────────────────────────────────────────────────────────────────────────────────────
Thời gian sống           15 Phút                            7 Ngày
Định dạng                JWT (Header.Payload.Signature)     Chuỗi Opaque Random (Base64)
Lưu trữ phía Client     HttpOnly Cookie (`AUTH_TOKEN`)     HttpOnly Cookie (`REFRESH_TOKEN`)
                                                            Path restriction: `/api/v1/auth`
Lưu trữ phía Server     Không (Stateless)                  PostgreSQL (`refresh_tokens`)
                                                            Lưu bản mã SHA-256 (Hashed)
Cơ chế kiểm soát          Kiểm tra `tokenVersion` DB        Xoay vòng Token (Rotation) &
                                                            Thu hồi tức thì (Revocation)
──────────────────────────────────────────────────────────────────────────────────────────
```

### 5.2 Cơ Chế Vô Hiệu Hóa Token Tức Thì (Token Versioning)

Một nhược điểm của JWT Stateless là không thể thu hồi trước khi hết hạn (15 phút). Ladux giải quyết triệt để bằng thuộc tính `tokenVersion` (kiểu `int`) trong entity `User`:

1. Khi cấp Access Token, `tokenVersion` hiện tại của User được đưa vào Claim của JWT payload.
2. Khi `JwtFilter` chặn HTTP request:
   - Đọc `tokenVersion` từ JWT Claim.
   - So sánh với `tokenVersion` hiện tại của User trong Database (thông qua `UserPrincipal`).
   - Nếu `tokenVersion` trong JWT khác `tokenVersion` trong DB -> Reject Request ngay lập tức.
3. Khi người dùng bấm **Logout**, **Đổi mật khẩu**, hoặc Admin **Khóa tài khoản**:
   - Gọi `refreshTokenService.revokeSessionAndBump(rawToken)` -> Thu hồi Refresh Token đồng thời thực thi `userRepository.incrementTokenVersion(userId)`.
   - **Kết quả:** Tất cả Access Token cũ (dù mới phát hành 1 phút trước) đều trở nên vô hiệu tức thì.

### 5.3 Bảo Vệ Endpoint Đăng Nhập Phân Tán (LoginRateLimitFilter)

Để chống tấn công Dò quét Mật khẩu (Brute-Force Attack) và Từ chối Dịch vụ (DoS):
- Class `LoginRateLimitFilter` được gán annotation `@Order(Ordered.HIGHEST_PRECEDENCE)` -> Chạy đầu tiên trong toàn bộ chuỗi Filter.
- Chỉ lọc duy nhất trên endpoint: `POST /api/v1/auth/login`.
- Sử dụng thư viện **Bucket4j** kết hợp **Redis Proxy Manager (Lettuce)** -> Lưu trữ Bucket rate-limit theo địa chỉ IP Client (`X-Forwarded-For` hoặc `RemoteAddr`).
- Quy tắc: Tối đa **5 lần thử / 1 phút**. Khi vượt quá -> Trả về HTTP Status `429 Too Many Requests` kèm JSON thông báo và Response Header `Retry-After: 60`.
- Nhờ lưu trữ trên Redis, quy tắc Rate Limit hoạt động chính xác tuyệt đối ngay cả khi mở rộng ngang hệ thống (Cluster nhiều node Backend).

### 5.4 Luồng Đăng Nhập Google OAuth2 (OAuth2SuccessHandler)

```
User -> Click "Đăng nhập Google" -> Chuyển hướng Google Authorization Server
     -> Xác thực thành công -> Google Redirect về `/login/oauth2/code/google`
     -> Spring Security kích hoạt `OAuth2SuccessHandler.onAuthenticationSuccess()`
         ├── 1. Trích xuất email từ `OAuth2User.getAttribute("email")`.
         ├── 2. Tra cứu `userRepository.findByEmail(email)`.
         │      - Nếu không tồn tại -> Trả HTTP 401 "OAuth2 user is not registered".
         │      - (Ladux không tự động tạo tài khoản lạ để đảm bảo kiểm soát người dùng).
         ├── 3. Kiểm tra `user.isActive()` -> Nếu false -> Trả HTTP 403 "Account disabled".
         ├── 4. Tạo Access Token JWT & Refresh Token mới.
         ├── 5. Đính kèm 2 Cookie `AUTH_TOKEN` & `REFRESH_TOKEN` vào Response.
         └── 6. Redirect Client về URL cấu hình (`app.oauth2.success-redirect`).
```

### 5.5 Phân Quyền URL Matrix (SecurityConfig)

- **CORS Configuration:** Khai báo danh sách origin cho phép (`localhost:3000`, `ladux.vn`), cho phép gửi Credentials (`allowCredentials=true`), chấp nhận các Header `Authorization`, `Content-Type`, `Cookie`, `X-XSRF-TOKEN`.
- **CSRF Protection:** Sử dụng `CookieCsrfTokenRepository.withHttpOnlyFalse()` (để JavaScript phía Client có thể đọc Cookie `XSRF-TOKEN` và gửi Header `X-XSRF-TOKEN`). Bỏ qua CSRF đối với toàn bộ các endpoint REST API `/api/v1/**` vì đã sử dụng hạ tầng Token authentication.
- **Phân Quyền Chi Tiết:**
  - `PUBLIC (permitAll)`: `/api/v1/auth/**`, `/oauth2/**`, `POST /api/v1/payments/vnpay-webhook`, `GET /uploads/**`, `GET /api/v1/products/**`, `GET /api/v1/brands/**`, `GET /api/v1/categories/**`, `GET /api/v1/reviews/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health/**`, `/actuator/info`.
  - `ADMIN (hasRole 'ADMIN')`: `/actuator/**`, `/api/v1/admin/**`.
  - `AUTHENTICATED`: Tất cả các request còn lại.

---

## 6. Luồng Checkout 9 Bước Chi Tiết (Checkout Flow)

Luồng Checkout là trái tim của hệ thống E-commerce, được quản lý tại phương thức `OrderServiceImpl.createOrder(userId, request)`. Toàn bộ 9 bước dưới đây được thực hiện trong **MỘT TRANSACTION DUY NHẤT (`@Transactional`)** nhằm đảm bảo tính toàn vẹn dữ liệu tuyệt đối:

```
[BẮT ĐẦU TRANSACTION]
  │
  ├── 1. Validate User Active
  │      - Kiểm tra User tồn tại và `user.isActive() == true`.
  │
  ├── 2. Lock Giỏ Hàng Bi Quan (Pessimistic Lock Cart)
  │      - Gọi `cartRepository.findByUserIdForUpdate(userId)` (`SELECT ... FOR UPDATE`).
  │      - Ngăn chặn triệt để trường hợp User gửi 2 request Checkout đồng thời từ 2 tab trình duyệt.
  │      - Kiểm tra giỏ hàng không được rỗng.
  │
  ├── 3. Trừ Tồn Kho Nguyên Tử & Chốt Giá (InventoryService)
  │      - Gọi `inventoryService.reserveStockAndPriceLines(cartItems)` (`Propagation.MANDATORY`).
  │      - Với mỗi sản phẩm: Thực thi query UPDATE nguyên tử:
  │        `UPDATE product_variants SET stock_quantity = stock_quantity - :qty WHERE id = :id AND stock_quantity >= :qty`
  │      - Nếu `rowsAffected == 0` -> Ném `InsufficientStockException` -> ROLLBACK toàn bộ.
  │      - Tải đối tượng `ProductVariant` -> Chốt giá snapshot `sellingPrice` vào DTO `LineDraft`.
  │
  ├── 4. Redeem Mã Giảm Giá (CouponRedemptionService)
  │      - Gọi `couponRedemptionService.redeem(code, subTotal)` (`Propagation.MANDATORY`).
  │      - Khóa coupon bi quan: `couponRepository.findByCodeForUpdate(code)` (`FOR UPDATE`).
  │      - Thỏa mãn rules (`isExpired`, `isUsageLimitReached`, `isBelowMinOrderValue`).
  │      - Tính `discountAmount` -> Tăng số lần sử dụng `coupon.setUsedCount(usedCount + 1)`.
  │
  ├── 5. Tính Tổng Tiền & Khởi Tạo Đơn Hàng (Order Entity)
  │      - `subTotal = SUM(lineTotal)`, `finalAmount = MAX(0, subTotal - discountAmount)`.
  │      - Khởi tạo `Order` với trạng thái ban đầu **`OrderStatus.PENDING`**.
  │      - Tạo danh sách `OrderItem` với snapshot `priceAtPurchase`.
  │      - Ghi vết `OrderHistory` đầu tiên: status `PENDING`, description "Order created".
  │
  ├── 6. Khởi Tạo Trạng Thái Thanh Toán (PaymentAttemptService)
  │      - Nếu phương thức là `VNPAY`: Tính hạn thanh toán `paymentExpiresAt = Instant.now() + 15 phút`.
  │      - Nếu phương thức là `COD`: `paymentExpiresAt = null`.
  │      - Tạo bản ghi `Payment` với trạng thái `PaymentStatus.PENDING`.
  │
  ├── 7. Lưu Đơn Hàng & Ghi Sổ Cái Kho (StockMovementService)
  │      - Thực thi `orderRepository.save(order)` (Cascade lưu OrderItem, OrderHistory, Payment).
  │      - Gọi `stockMovementService.recordLedgerEntry(...)` (`Propagation.MANDATORY`) cho từng item.
  │      - Loại biến động: `SALE_OUT`, Tham chiếu: `ORDER`, ReferenceId: `order.getId()`.
  │      - Ghi chú: "Bán hàng từ đơn #XYZ". (Lưu ý: Không cộng/trừ lại tồn kho vì đã trừ ở Bước 3).
  │
  ├── 8. Dọn Dẹp Giỏ Hàng (Clear Cart)
  │      - Thực thi `cart.getItems().clear()`.
  │      - Nhờ cấu hình `orphanRemoval = true`, Hibernate sẽ tự động bắn câu lệnh `DELETE` các dòng trong `cart_items`.
  │
  └── 9. Commit Transaction & Trả Về Response DTO
         - Mọi thay đổi DB được Commit thành công. Trả về `OrderResponse` chứa đầy đủ chi tiết đơn hàng.
[KẾT THÚC TRANSACTION]
```

---

## 7. Order State Machine & Lifecycle Management

### 7.1 Ma Trận Chuyển Trạng Thái Đơn Hàng (Order State Machine)

Hệ thống quản lý chặt chẽ ma trận chuyển đổi trạng thái trong class `OrderStateMachineImpl`:

```
                             ┌────────────────┐
                             │    PENDING     │ (Mới tạo, chờ thanh toán)
                             └───────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │ (Thanh toán thành công)         │ (Hủy đơn/Hết hạn)
                    ▼                                 ▼
           ┌────────────────┐                ┌────────────────┐
           │   CONFIRMED    │                │   CANCELLED    │ (Terminal Fail State)
           └───────┬────────┘                └────────────────┘
                   │                                  ▲
                   │ (Admin đóng gói & gửi đơn)      │ (Admin hủy khi CONFIRMED)
                   ▼                                  │
           ┌────────────────┐                         │
           │    SHIPPED     ├─────────────────────────┘
           └───────┬────────┘ (Yêu cầu Tracking Number)
                   │
                   │ (Giao hàng thành công)
                   ▼
           ┌────────────────┐
           │   DELIVERED    │ (Terminal Success State)
           └───────┬────────┘
                   │
                   │ (Khách gửi yêu cầu đổi trả)
                   ▼
           ┌────────────────┐
           │RETURN_REQUESTED│
           └───────┬────────┘
                   │
                   ├─── (Admin từ chối trả) ─────────► Trở lại DELIVERED
                   │
                   │ (Admin xác nhận nhận lại hàng về kho)
                   ▼
           ┌────────────────┐
           │    RETURNED    │ (Đã nhận hàng về kho)
           └───────┬────────┘
                   │
                   │ (Admin thực hiện hoàn tiền)
                   ▼
           ┌────────────────┐
           │    REFUNDED    │ (Terminal Refund State)
           └────────────────┘
```

### 7.2 Lớp Dịch Vụ Tác Vụ Phụ (OrderLifecycleService)

Để giữ cho `OrderStateMachine` thuần túy kiểm soát luồng, các Tác vụ phụ (Side-effects) được tách sang `OrderLifecycleService` với thuộc tính `@Transactional(propagation = Propagation.MANDATORY)`:

1. **`confirmAfterSuccessfulPayment(Order order)`:**
   - Kích hoạt khi Webhook VNPay báo thanh toán thành công.
   - Chuyển `status -> CONFIRMED`, xóa hạn thanh toán (`paymentExpiresAt = null`), bổ sung `OrderHistory` ("Payment succeeded").
   - Thiết kế Idempotent: Nếu đơn đã `CONFIRMED` từ trước -> Chỉ clear timer và return an toàn.

2. **`cancelOrder(Order order, String description)`:**
   - Hoàn trả tồn kho (`releaseReservedInventory`): Tăng lại `stockQuantity` cho từng `ProductVariant` và ghi sổ cái `StockMovement` loại `RETURN_IN`.
   - Hoàn trả mã giảm giá (`rollbackCouponUsage`): Giảm `usedCount` của `Coupon` đi 1 đơn vị.
   - Chuyển `status -> CANCELLED`, xóa hạn thanh toán, bổ sung `OrderHistory`.
   - Thiết kế Idempotent: Nếu đơn đã `CANCELLED` từ trước -> Return ngay, tránh hoàn kho 2 lần.

3. **`processReturnOrder(int orderId, String reason, User admin)`:**
   - Xử lý khi Admin nhận lại hàng hoàn từ khách.
   - Chuyển `status -> RETURNED`. Gọi `stockMovementService.recordMovement(...)` nhập lại kho thực tế + ghi sổ cái audit.

### 7.3 Tác Vụ Định Kỳ Tự Động Hủy Đơn Quá Hạn (expirePendingOrders)

- Thuộc tính `@Scheduled(fixedDelayString = "${ladux.order-expiration.fixed-delay-ms:60000}")`: Chạy mỗi 60 giây.
- Annotation `@SchedulerLock(name = "expirePendingOrdersLock", lockAtMostFor = "10m", lockAtLeastFor = "1m")`: Sử dụng ShedLock để bảo vệ tác vụ không bị chạy trùng lặp giữa các node Server khi scale-out.
- Thực thi query: `orderRepository.findExpiredOrdersForUpdate(OrderStatus.PENDING, Instant.now())`.
- Tìm tất cả các đơn `PENDING` có `paymentExpiresAt <= NOW()`, tiến hành gọi `orderLifecycleService.cancelOrder(...)` để nhả lại tồn kho và coupon cho thị trường.

---

## 8. Thanh Toán VNPay & Webhook Production-Grade

### 8.1 Luồng Tạo Cổng Thanh Toán (PaymentServiceImpl)

1. Client gọi API `POST /api/v1/payments`:
2. Service kiểm tra quyền sở hữu đơn hàng (IDOR check).
3. Kiểm tra tính Idempotent của Payment:
   - Nếu đã có Payment `SUCCESS` -> Chặn lại.
   - Nếu đã có Payment `PENDING` -> Trả lại thông tin Payment hiện tại.
   - Nếu Payment gần nhất `FAILED` -> Cho phép tạo Payment Attempt mới.
4. Xây dựng tham số VNPay (`vnp_Version`, `vnp_Command`, `vnp_TmnCode`, `vnp_Amount`, `vnp_TxnRef`, `vnp_OrderInfo`, `vnp_CreateDate`, `vnp_ExpireDate`, `vnp_IpAddr`).
5. Sắp xếp alphabet các tham số và tính chữ ký bảo mật HMAC-SHA512 qua `VNPayUtils.hmacSHA512(secretKey, data)`.
6. Trả về URL thanh toán sang VNPay Sandbox/Production cho Frontend chuyển hướng Client.

### 8.2 Webhook VNPay IPN Xử Lý 4 Bước Chuẩn Production (PaymentWebhookServiceImpl)

Endpoint Webhook `POST /api/v1/payments/vnpay-webhook` là công khai (Public) để Cổng thanh toán VNPay gọi sang theo cơ chế Server-to-Server. Logic xử lý tuân thủ 4 bước nghiêm ngặt:

```
                          VNPay Server gửi Request IPN Callback
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ BƯỚC 1: Validate Chữ Ký HMAC-SHA512 TRƯỚC KHI MỞ DB TRANSACTION           │
 │ - Lấy `vnp_SecureHash` từ Payload. Re-calculate HMAC trên toàn bộ params. │
 │ - Nếu chữ ký KHÔNG khớp -> Log Cảnh báo & Trả về JSON `invalidSignature` │
 │   (HTTP Status 200 OK theo chuẩn VNPay nhưng code lỗi chữ ký "97").      │
 │ - Ý nghĩa: Chặn đứng request giả mạo ngay từ cổng vào, tiết kiệm DB.    │
 └──────────────────────────────────────────────────────────────────────────┘
                                           │ (Chữ ký chuẩn 100%)
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ BƯỚC 2: Trích Xuất Dữ Liệu Payload                                       │
 │ - `gatewayTransactionNo = vnp_TransactionNo`                            │
 │ - `orderId = Integer.parseInt(vnp_TxnRef)`                              │
 │ - `gatewayAmount = vnp_Amount / 100` (VNPay quy định nhân 100)           │
 │ - `responseCode = vnp_ResponseCode` ("00" là Thành công)                │
 └──────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ BƯỚC 3: Mở DB Transaction & Khóa Bi Quan Order (Pessimistic Lock)       │
 │ - Gọi `orderRepository.findWithItemsByIdForUpdate(orderId)`.             │
 │ - IDEMPOTENCY LỚP 1 (State Check):                                       │
 │   - Nếu `payment.status == SUCCESS` -> Trả về `alreadyProcessed` (code 02)│
 │   - Nếu `payment.status == FAILED` -> Trả về `alreadyProcessed`.         │
 └──────────────────────────────────────────────────────────────────────────┘
                                           │ (Đơn đang chờ PENDING)
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ BƯỚC 4: Cập Nhật Trạng Thái & Kích Hoạt State Machine                     │
 │ - Nếu `responseCode.equals("00")`:                                      │
 │   - Bắt lỗi IDEMPOTENCY LỚP 2 qua DB Unique Constraint:                  │
 │     Gán `payment.setTransactionNo(gatewayTransactionNo)`.                │
 │     Nếu bị trùng `vnp_TransactionNo` -> Catch `DataIntegrityViolation`   │
 │     và bỏ qua an toàn.                                                   │
 │   - Cập nhật `payment.setStatus(PaymentStatus.SUCCESS)`.                 │
 │   - Gọi `orderLifecycleService.confirmAfterSuccessfulPayment(order)`.    │
 │ - Nếu `responseCode != "00"` (Thanh toán thất bại/hủy giữa chừng):       │
 │   - Cập nhật `payment.setStatus(PaymentStatus.FAILED)`.                 │
 │   - Gọi `orderLifecycleService.cancelOrder(order, "VNPay failed")`.      │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Quản Lý Chuỗi Cung Ứng (Supply Chain & Procurement)

### 9.1 Vòng Đời Đơn Mua Hàng Nhập Kho (PurchaseOrder Status)

```
       ┌────────────────┐
       │    PENDING     │ (Mới tạo đơn nhập hàng với Nhà cung cấp)
       └───────┬────────┘
               │
       ┌───────┴────────┐
       │   CONFIRMED    │ (Nhà cung cấp xác nhận đơn hàng)
       └───────┬────────┘
               │
 ┌─────────────┴─────────────┐
 │ (Nhận một phần hàng)      │ (Nhận đủ 100% hàng)
 ▼                           ▼
┌────────────────┐   ┌────────────────┐
│PARTIALLY_RECEIV│   │    RECEIVED    │ (Nhập kho hoàn tất - Terminal State)
└───────┬────────┘   └────────────────┘
        │ (Nhận nốt phần còn lại)
        └───────────────────► RECEIVED
```

### 9.2 Luồng Nhận Hàng Nhập Kho Chi Tiết (PurchaseOrderServiceImpl.receiveGoods)

Phương thức `receiveGoods(id, request, receivedByUserId)` cho phép Admin nhập hàng thành nhiều đợt (Partial Receiving):

1. Mở Transaction và Khóa bi quan Đơn mua hàng: `purchaseOrderRepository.findWithItemsByIdForUpdate(id)`.
2. Bảo vệ trạng thái: Không xử lý nếu đơn đã `CANCELLED` hoặc đã `RECEIVED` hoàn toàn.
3. Duyệt qua danh sách các mặt hàng nhận trong đợt này (`AdminPurchaseOrderReceiveRequest.ReceiveLine`):
   - Kiểm tra `itemId` thuộc đơn mua hàng.
   - Kiểm tra lũy kế số lượng nhận: `alreadyReceived + newReceivedQty <= item.getQuantity()`. Không cho phép nhận vượt quá số lượng đặt mua.
   - Khóa bi quan sản phẩm: `productVariantRepository.findByIdForUpdate(productVariantId)`.
   - **Tăng tồn kho & Ghi sổ cái:** Gọi `stockMovementService.recordMovement(...)`:
     - Tự động cộng tồn kho: `productVariant.setStockQuantity(stock + newReceivedQty)`.
     - Thêm bản ghi `StockMovement`: loại `PURCHASE_IN`, tham chiếu `PURCHASE_ORDER`, referenceId `po.getId()`.
   - Cập nhật số lượng đã nhận trên dòng item: `item.setReceivedQuantity(newReceived)`.
4. Tính toán và chuyển trạng thái đơn mua hàng tự động (`resolveStatusAfterReceive`):
   - Nếu tất cả các dòng đã nhận đủ 100% (`receivedQuantity >= quantity`) -> Chuyển trạng thái sang **`RECEIVED`**.
   - Nếu mới nhận một phần -> Chuyển trạng thái sang **`PARTIALLY_RECEIVED`**.

---

## 10. Sổ Cái Tồn Kho (Inventory Ledger Pattern)

### 10.1 Phân Biệt Hai Phương Thức Cốt Lõi (StockMovementServiceImpl)

Để giải quyết triệt để bài toán tính trùng tồn kho (Double Counting) giữa luồng trừ hàng nguyên tử (Atomic Update) và luồng cộng tồn kho truyền thống, hệ thống định nghĩa 2 hàm độc lập trong `StockMovementServiceImpl`:

```java
// 1. CHUYỂN ĐỔI TỒN KHO & GHI SỔ CÁI (Dùng cho: Nhập kho PO, Điều chỉnh kho thủ công Admin, Nhận hàng hoàn)
@Transactional(propagation = Propagation.MANDATORY)
public StockMovement recordMovement(ProductVariant variant, int signedQty, StockMovementType type, ...) {
    int newStock = variant.getStockQuantity() + signedQty;
    if (newStock < 0) throw new InsufficientStockException("Tồn kho không đủ để xuất");
    variant.setStockQuantity(newStock); // <--- THỰC HÀNH MUTATE TỒN KHO TRỰC TIẾP
    StockMovement movement = StockMovement.builder()...build();
    return repo.save(movement);          // <--- GHI NHẬT KÝ SỔ CÁI
}

// 2. CHỈ GHI SỔ CÁI - KHÔNG MUTATE TỒN KHO (Dùng cho: Checkout bán hàng, Hủy đơn nhả kho)
@Transactional(propagation = Propagation.MANDATORY)
public StockMovement recordLedgerEntry(ProductVariant variant, int signedQty, StockMovementType type, ...) {
    // KHÔNG gọi variant.setStockQuantity() vì Tồn kho đã được thay đổi ở lệnh Atomic UPDATE trước đó!
    StockMovement movement = StockMovement.builder()...build();
    return repo.save(movement);          // <--- CHỈ GHI NHẬT KÝ SỔ CÁI ĐỂ AUDIT
}
```

### 10.2 Quy Ước Dấu Số Lượng (`signedQuantity`)

Dựa trên `StockMovementType`, số lượng được tự động chuẩn hóa dấu:
- **Dấu Dương (+):** `PURCHASE_IN` (Nhập mua), `RETURN_IN` (Khách trả lại/Hủy đơn nhả kho), `ADJUSTMENT_IN` (Kiểm kê tăng).
- **Dấu Âm (-):** `SALE_OUT` (Bán hàng), `DAMAGE_OUT` (Hàng hư hỏng/hủy mẫu), `ADJUSTMENT_OUT` (Kiểm kê giảm).

### 10.3 Ma Trận Tích Hợp Tồn Kho Toàn Hệ Thống

| Luồng Nghiệp Vụ | Thao Tác Tồn Kho | Thao Tác Sổ Cái (StockMovement) | Hàm Được Gọi |
|─────────────────|──────────────────|─────────────────────────────────|──────────────|
| **Checkout Đặt Hàng** | Trừ atomic SQL `deductStockAtomically` | Ghi `SALE_OUT` (dấu -) | `recordLedgerEntry()` |
| **Hủy Đơn / Hết Hạn** | Cộng trực tiếp `stockQuantity + qty` | Ghi `RETURN_IN` (dấu +) | `recordLedgerEntry()` |
| **Nhận Hàng Mua (PO)** | Cộng trực tiếp `stockQuantity + qty` | Ghi `PURCHASE_IN` (dấu +) | `recordMovement()` |
| **Khách Trả Hàng Về Kho** | Cộng trực tiếp `stockQuantity + qty` | Ghi `RETURN_IN` (dấu +) | `recordMovement()` |
| **Điều Chỉnh Kho Admin** | Cộng/Trừ theo dấu điều chỉnh | Ghi `ADJUSTMENT_IN/OUT` | `recordMovement()` |

---

## 11. Chiến Lược Cache & Performance Tuning (Redis)

### 11.1 Hạ Tầng Cache Redis (`Spring Cache`)

- Cấu hình qua `@EnableCaching` và `RedisCacheManager`.
- Cache Names được sử dụng: `orders`, `orderItems`, `orderHistories`, `products`, `carts`, `users`, `coupons`, `payments`, `brands`, `categories`, `reviews`.
- Mẫu câu lệnh:
  - `@Cacheable(value = "products", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")`
  - `@CacheEvict(value = "products", allEntries = true)`

### 11.2 Giải Quyết Lỗi Kinh Điển Hibernate `MultipleBagFetchException`

Trong JPA/Hibernate, một Entity không thể Fetch Join đồng thời 2 tập hợp dạng `List` (Bag) trong một câu lệnh JPQL có Phân trang (`Pageable`) vì sẽ tạo ra Tích Đề-các (Cartesian Product) làm sai lệch kết quả đếm trang và phình đại bộ nhớ.

Entity `Order` chứa 3 tập hợp List: `items`, `histories`, `payments`. Khi gọi API xem danh sách đơn hàng `getOrdersByUserId(userId, pageable)`, Ladux áp dụng **Kỹ Thuật Phân Trang 2 Bước (2-Step Pagination Pattern)** cực kỳ tối ưu:

```java
@Override
@Transactional(readOnly = true)
public Page<OrderResponse> getOrdersByUserId(int userId, Pageable pageable) {
    // BƯỚC 1: Query nhẹ chỉ lấy danh sách Order IDs theo phân trang (Không JOIN Collection nào)
    Page<Integer> idPage = repo.findIdsByUserId(userId, pageable);
    if (idPage.isEmpty()) {
        return idPage.map(id -> (OrderResponse) null);
    }
    
    // BƯỚC 2: Fetch đầy đủ Entities (kèm Collections) theo danh sách IDs vừa lấy bằng @EntityGraph
    List<Order> orders = repo.findByIdIn(idPage.getContent());
    
    // BƯỚC 3: Sắp xếp lại danh sách kết quả theo đúng thứ tự Sort ban đầu của Page IDs
    Map<Integer, Order> byId = orders.stream()
            .collect(Collectors.toMap(Order::getId, o -> o));
    List<OrderResponse> content = idPage.getContent().stream()
            .map(id -> OrderResponse.fromEntity(byId.get(id)))
            .filter(Objects::nonNull)
            .toList();
            
    return new PageImpl<>(content, pageable, idPage.getTotalElements());
}
```

### 11.3 Tối Ưu Tìm Kiếm Chuỗi Chuẩn Xác Chi Tiết (PostgreSQL GIN Trigram)

- Migration `V12` kích hoạt Extension `pg_trgm`.
- Migration `V19` tạo chỉ mục GIN Trigram Index:
  `CREATE INDEX idx_products_lower_name_trgm ON products USING gin (lower(name) gin_trgm_ops);`
- Giúp các câu lệnh tìm kiếm sản phẩm theo tên `LOWER(name) LIKE %keyword%` chạy với tốc độ tức thì (sub-millisecond) ngay cả khi dữ liệu phình to lên hàng triệu dòng.

---

## 12. Xử Lý Lỗi Thống Nhất (Global Exception Handling)

Tất cả các Ngoại lệ (Exception) xảy ra ở bất kỳ tầng nào khi bắn lên Controller đều được chặn bắt bởi `@RestControllerAdvice` trong class `GlobalExceptionHandler` và chuẩn hóa về đối tượng `ErrorResponse`:

```java
public record ErrorResponse(
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    LocalDateTime timestamp,
    int status,
    String error,
    String message
) {}
```

### Bảng Ánh Xạ Ngoại Lệ Sang HTTP Status Code

| Exception Class | HTTP Status | Message Trả Về Client | Ghi Chú Bảo Mật / Nghiệp Vụ |
|─────────────────|─────────────|───────────────────────|─────────────────────────────|
| `ResourceNotFoundException` | `404 NOT_FOUND` | Message từ Exception | Không tìm thấy Tài nguyên |
| `BusinessRuleException` | `400 BAD_REQUEST` | Message từ Exception | Vi phạm quy tắc nghiệp vụ |
| `InsufficientStockException` | `400 BAD_REQUEST` | Message từ Exception | Tồn kho không đủ bán |
| `MethodArgumentNotValid` | `400 BAD_REQUEST` | Gom chuỗi lỗi từ Bean Validation | Sai định dạng request DTO |
| `ConstraintViolationException` | `400 BAD_REQUEST` | Chuỗi vi phạm constraint | Lỗi validation tham số |
| `UsernameNotFoundException` | `401 UNAUTHORIZED` | "Username hoac password khong dung" | Bảo mật: Ẩn sự tồn tại User |
| `BadCredentialsException` | `401 UNAUTHORIZED` | "Username hoac password khong dung" | Bảo mật: Message dùng chung |
| `AccessDeniedException` | `403 FORBIDDEN` | "Ban khong co quyen thuc hien thao tac nay" | Từ chối phân quyền |
| `DataIntegrityViolation` | `409 CONFLICT` | Thông điệp dịch từ SQL State | Xử lý lỗi trùng lặp/Ràng buộc |
| `Exception` (Fallback) | `500 INTERNAL_SERVER_ERROR` | "Da xay ra loi he thong" | Log full stacktrace phía Server |

### Cơ Chế Phân Tích SQL State Thông Minh Đối Với `DataIntegrityViolationException`

Khi gặp lỗi vi phạm ràng buộc DB, thay vì ném ra câu lệnh SQL thô kệch, `GlobalExceptionHandler` giải mã SQL State:
- SQL State `23505` (Unique Constraint): Sử dụng Regex `unique constraint "([^"]+)"` để bắt tên constraint. Nếu chứa "email" -> Trả "Email này đã tồn tại trong DB", nếu chứa "username" -> Trả "Username này đã tồn tại trong DB".
- SQL State `23503` (Foreign Key Constraint): Trả về "Dữ liệu đang được tham chiếu bởi bản ghi khác".
- SQL State `23502` (Not Null Constraint): Sử dụng Regex `null value in column "([^"]+)"` để trích xuất tên cột -> Trả về "Backend đang gửi thiếu cột bắt buộc 'column_name'".
- SQL State `23514` (Check Constraint): Trả về "Dữ liệu không thỏa mãn ràng buộc kiểm tra".

---

## 13. Scheduled Jobs & Distributed Locking (ShedLock)

### Tác Vụ Quét Đơn Hàng Hết Hạn (`expirePendingOrders`)

- **Vị trí:** `OrderStateMachineImpl.expirePendingOrders()`.
- **Cấu hình Scheduler:** `@Scheduled(fixedDelayString = "${ladux.order-expiration.fixed-delay-ms:60000}")`.
- **Khóa Phân Tán ShedLock:** `@SchedulerLock(name = "expirePendingOrdersLock", lockAtMostFor = "10m", lockAtLeastFor = "1m")`.
  - `lockAtMostFor`: Giữ khóa tối đa 10 phút. Nếu Server bị crash giữa chừng, khóa sẽ tự giải phóng sau 10 phút.
  - `lockAtLeastFor`: Giữ khóa tối thiểu 1 phút để ngăn các Server có đồng hồ lệch giây chạy lại tác vụ.
  - **Lưu trữ:** Lưu vào bảng `shedlock` trong PostgreSQL (được khởi tạo từ migration `V11`).

---

## 14. API Surface & Endpoint Reference Chi Tiết

Base Path: `/api/v1`

### 14.1 Nhóm Xác Thực & Hệ Thống (Public Auth & System)

| HTTP Method | API Path | Phân Quyền | Tóm Tắt Chức Năng |
|-------------|----------|------------|-------------------|
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản (Tạo User + Customer + Cart) |
| `POST` | `/api/v1/auth/login` | Public (Rate Limited) | Đăng nhập -> Cấp JWT Cookie `AUTH_TOKEN` & `REFRESH_TOKEN` |
| `POST` | `/api/v1/auth/refresh` | Public (Cookie) | Xoay vòng Refresh Token lấy Access Token mới |
| `POST` | `/api/v1/auth/logout` | Public (Cookie) | Thu hồi Refresh Token & tăng `tokenVersion` |
| `GET` | `/api/v1/auth/csrf` | Public | Lấy CSRF token cho Frontend/Postman |
| `GET` | `/oauth2/authorization/google` | Public | Kích hoạt luồng đăng nhập Google OAuth2 |

### 14.2 Nhóm Khách Hàng (Customer APIs)

| HTTP Method | API Path | Phân Quyền | Tóm Tắt Chức Năng |
|-------------|----------|------------|-------------------|
| `GET` | `/api/v1/products/**` | Public | Xem danh sách/Chi tiết sản phẩm, tìm kiếm Trigram |
| `GET` | `/api/v1/brands/**` | Public | Xem danh sách/Chi tiết thương hiệu |
| `GET` | `/api/v1/categories/**` | Public | Xem cây danh mục sản phẩm |
| `GET` | `/api/v1/reviews/**` | Public | Xem đánh giá sản phẩm |
| `GET` | `/api/v1/cart` | Authenticated | Xem giỏ hàng của tôi |
| `POST` | `/api/v1/cart/items` | Authenticated | Thêm sản phẩm vào giỏ hàng |
| `PUT` | `/api/v1/cart/items/{id}` | Authenticated | Cập nhật số lượng item trong giỏ |
| `DELETE` | `/api/v1/cart/items/{id}` | Authenticated | Xóa item khỏi giỏ hàng |
| `POST` | `/api/v1/orders` | Authenticated | Thực hiện Checkout đặt hàng (9 bước) |
| `GET` | `/api/v1/orders/user` | Authenticated | Xem lịch sử đơn hàng của tôi (2-Step Pagination) |
| `GET` | `/api/v1/orders/{id}` | Authenticated | Xem chi tiết đơn hàng (IDOR protected) |
| `POST` | `/api/v1/orders/{id}/payments/retry` | Authenticated | Thử lại thanh toán cho đơn bị FAILED |
| `POST` | `/api/v1/payments` | Authenticated | Tạo Link thanh toán VNPay |
| `POST` | `/api/v1/payments/vnpay-webhook` | Public | Webhook VNPay IPN Server-to-Server |
| `POST` | `/api/v1/reviews` | Authenticated | Thêm đánh giá sản phẩm (1 review/user/product) |
| `GET/POST/DELETE` | `/api/v1/wishlists/**` | Authenticated | Quản lý danh sách yêu thích |
| `GET/POST/PUT/DELETE`| `/api/v1/user-addresses/**` | Authenticated | Quản lý sổ địa chỉ giao hàng |
| `GET/PUT` | `/api/v1/users/me` | Authenticated | Xem/Cập nhật thông tin profile & Avatar |

### 14.3 Nhóm Quản Trị Viên (Admin APIs - Role `ADMIN`)

| HTTP Method | API Path | Tóm Tắt Chức Năng Admin |
|-------------|----------|-------------------------|
| `GET/PUT/PATCH` | `/api/v1/admin/orders/**` | Xem tất cả đơn hàng, chuyển trạng thái đơn (State Machine) |
| `POST` | `/api/v1/admin/orders/{id}/return` | Xác nhận nhận lại hàng hoàn về kho (`RETURNED`) |
| `POST` | `/api/v1/admin/orders/{id}/refund` | Xác nhận hoàn tiền cho đơn hàng (`REFUNDED`) |
| `CRUD` | `/api/v1/admin/products/**` | Quản lý Sản phẩm, Biến thể (Variant), Ảnh sản phẩm |
| `CRUD` | `/api/v1/admin/brands/**` | Quản lý Thương hiệu & Logo URL |
| `CRUD` | `/api/v1/admin/categories/**` | Quản lý Danh mục cây |
| `CRUD` | `/api/v1/admin/colors/**` | Quản lý Mã màu sắc |
| `CRUD` | `/api/v1/admin/coupons/**` | Quản lý Mã giảm giá |
| `GET/PUT` | `/api/v1/admin/customers/**` | Quản lý CRM Khách hàng (Điểm thưởng, Cấp độ, Tổng chi tiêu) |
| `CRUD` | `/api/v1/admin/suppliers/**` | Quản lý Nhà cung cấp |
| `CRUD` | `/api/v1/admin/product-suppliers/**` | Quản lý Giá nhập & Lead time của Nhà cung cấp |
| `POST/GET/PUT` | `/api/v1/admin/purchase-orders/**` | Quản lý Đơn mua hàng PO & Luồng Nhận hàng nhập kho |
| `GET/POST` | `/api/v1/admin/stock-movements/**` | Xem lịch sử Sổ cái tồn kho & Điều chỉnh kho thủ công |
| `GET` | `/api/v1/admin/payments/**` | Quản lý lịch sử thanh toán |
| `CRUD` | `/api/v1/admin/users/**` | Quản lý người dùng & Phân quyền |

---

## 15. DB Migration & Schema Versioning (Flyway)

Tất cả các thay đổi Cấu trúc Cơ sở dữ liệu được quản lý tập trung tại `src/main/resources/db/migration/`:

```
V1__init_schema.sql                      # Schema khởi tạo cơ bản (Users, Products, Orders, Cart, Roles)
V2__add_hot_path_indexes.sql             # Tạo chỉ mục cho các truy vấn hot path
V4__fix_seed_user_passwords.sql          # Sửa mật khẩu tài khoản seed
V5__disable_seed_user_passwords.sql      # Vô hiệu hóa mật khẩu seed không an toàn
V6__set_dev_admin_bcrypt_password.sql    # Đặt mật khẩu BCrypt cho Admin Dev
V7__add_payment_gateway_transaction_no_unique.sql # Thêm Unique Partial Index cho vnp_TransactionNo
V8__add_updated_at_to_core_tables.sql    # Bổ sung cột updated_at
V9__add_stock_quantity_check.sql         # Ràng buộc CHECK constraint stock_quantity >= 0
V10__harden_category_delete_constraints.sql # Siết chặt khóa ngoại xóa Danh mục
V11__create_shedlock_table.sql           # Tạo bảng shedlock cho tác vụ phân tán
V12__enable_pg_trgm_extension.sql        # Kích hoạt PostgreSQL Extension pg_trgm
V13__add_trigram_index_on_products.sql   # Chỉ mục Trigram đầu tiên cho products
V14__rename_updated_at_to_update_at.sql  # Chuẩn hóa tên cột
V15__add_created_at_to_coupons.sql       # Thêm ngày tạo cho Coupon
V16__add_rating_check_constraint_on_reviews.sql # Ràng buộc CHECK rating 1..5
V17__add_user_id_to_order_histories.sql  # Bổ sung user_id vào lịch sử đơn
V18__drop_wishlists_added_at.sql         # Dọn dẹp cột không dùng
V19__fix_trigram_index_to_lower_name.sql # Tối ưu Trigram Index với LOWER(name)
V20__create_refresh_tokens.sql           # Tạo bảng refresh_tokens
V21__add_token_version_to_users.sql      # Bổ sung cột token_version vào users
V22__add_customer_and_supply_chain.sql   # REFACTOR LỚN: Tạo customers, suppliers, product_suppliers,
                                         # purchase_orders, purchase_order_items, stock_movements;
                                         # Di trú dữ liệu từ users sang customers.
V23__insert_supply_chain_mock_data.sql   # Dữ liệu giả lập chuỗi cung ứng
V24__link_local_product_images.sql       # Cập nhật đường dẫn ảnh sản phẩm cục bộ
V25__update_category_images.sql          # Cập nhật ảnh danh mục
V26__add_image_to_categories.sql         # Bổ sung cột image vào categories
V27__drop_brand_logo_url.sql             # Xóa cột logo_url cũ của brands
V28__sync_schema_with_current_entities.sql # Đồng bộ Schema toàn diện với JPA Entities
V29__align_schema_with_current_models.sql   # Canh chỉnh ràng buộc dữ liệu nâng cao
V30__add_logo_url_to_brands.sql          # Khôi phục logo_url chuẩn cho thương hiệu
```

---

## 16. Đóng Gói, Triển Khai & Cấu Hình Hệ Thống

### 16.1 Multi-Stage Dockerfile Chuẩn Production

```dockerfile
# STAGE 1: Build JAR với Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# STAGE 2: Triển khai Runtime tối ưu
FROM eclipse-temurin:21-jre-alpine
RUN adduser -D ladux
USER ladux
WORKDIR /app
COPY --from=builder /build/target/ladux.jar app.jar
VOLUME /uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 16.2 Triển Khai Đa Dịch Vụ Với Docker Compose

```yaml
version: '3.8'
services:
  backend-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - SPRING_DATA_REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ladux_db
      POSTGRES_USER: ladux_user
      POSTGRES_PASSWORD: ladux_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ladux_user -d ladux_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
```

---

## 17. Đánh Giá Kiến Trúc, Nợ Kỹ Thuật & Lộ Trình Phát Triển

### 17.1 Các Điểm Mạnh Nổi Bật Về Kiến Trúc

1. **An Toàn Tồn Kho Tuyệt Đối:** Kết hợp giữa `UPDATE` SQL nguyên tử (`deductStockAtomically`), Khóa bi quan (`Pessimistic Lock`) và Ràng buộc `CHECK (stock_quantity >= 0)` giúp triệt tiêu hoàn toàn rủi ro overselling.
2. **Sổ Cái Kiểm Toán Bất Biến (Immutable Ledger):** Mọi biến động kho đều ghi nhận vào `StockMovement` theo nguyên tắc chỉ INSERT, tạo nên hệ thống kiểm toán minh bạch.
3. **Cổng Thanh Toán VNPay Chuẩn Production:** Kiểm tra chữ ký HMAC trước khi mở DB Transaction và cơ chế Idempotency 2 lớp chống xử lý trùng lặp Webhook.
4. **Thu Hồi JWT Tức Thì (Token Versioning):** Giải quyết điểm yếu cố hữu của JWT Stateless mà không cần duy trì Blacklist phức tạp trong bộ nhớ.
5. **Khóa Phân Tán Scheduler (ShedLock):** Đảm bảo an toàn tuyệt đối cho các tác vụ ngầm khi hệ thống mở rộng nhiều instance.
6. **Giải Quyết Triệt Để Lỗi Hibernate Fetch:** Áp dụng kỹ thuật Phân trang 2 bước (2-Step Pagination) ngăn ngừa lỗi `MultipleBagFetchException`.

### 17.2 Danh Sách Nợ Kỹ Thuật (Technical Debt)

- **Thiếu AuthenticationEntryPoint tùy chỉnh:** Khi gửi request thiếu Token vào một số API protected, Spring Security có thể trả về xử lý OAuth2 Redirect thay vì HTTP 401 JSON thuần.
- **Cấu hình Flyway Dev chứa nguy cơ:** Thuộc tính `clean-on-validation-error=true` ở profile dev có thể gây mất dữ liệu nếu dùng chung file properties.
- **Chiến lược Evict Cache quá rộng:** Sử dụng `allEntries = true` trên `@CacheEvict` khiến hiệu năng Cache chưa đạt đỉnh tối ưu.
- **Tính năng Điểm thưởng CRM chưa kích hoạt:** Model `Customer` đã có cột `loyaltyPoints` và `totalSpent` nhưng chưa gắn Event Listener để tự động tích điểm sau khi đơn hàng chuyển sang `DELIVERED`.
- **Hardcode Secret trong Properties:** Một số secret key dev vẫn nằm rải rác trong file thuộc tính thay vì ép buộc 100% truyền qua biến môi trường.

### 17.3 Lộ Trình Phát Triển Đề Xuất (System Architecture Roadmap)

#### Giai Đoạn 1: Production Hardening (1–4 Tuần)
- Thêm `AuthenticationEntryPoint` & `AccessDeniedHandler` trả về chuẩn HTTP 401/403 JSON cho toàn bộ đường dẫn `/api/**`.
- Kích hoạt logic tích điểm thưởng CRM tự động bằng cách viết `@EventListener` lắng nghe `OrderDeliveredEvent`.
- Loại bỏ hoàn toàn `clean-on-validation-error=true` khỏi các cấu hình chung.
- Bổ sung Integration Test cho luồng Checkout đồng thời (Concurrency Testing) với Testcontainers.

#### Giai Đoạn 2: Reliability & Efficiency (1–3 Tháng)
- Tối ưu hóa Cache Redis: Chuyển từ evict blanket (`allEntries=true`) sang Evict theo Key cụ thể (`products:id:123`).
- Tích hợp Structured Logging (Logback JSON Format) kết hợp MDC `X-Request-ID` để dễ dàng truy vết log phân tán.
- Thêm Dashboard giám sát Prometheus & Grafana (các chỉ số Latency p99, DB Connection Pool, Redis Hit Rate).

#### Giai Đoạn 3: Growth & Evolution (3–9 Tháng)
- Áp dụng Mẫu thiết kế **Domain Events + Outbox Pattern** để gửi Email thông báo và xử lý điểm thưởng bất đồng bộ (Async Processing).
- Xây dựng tác vụ Cảnh báo Tồn kho Thấp (Low Stock Alert Scheduled Job) dựa trên ngưỡng `lowStockThreshold`.
- Chuẩn bị sẵn sàng hạ tầng cho phép tách các Bounded Context (Identity, Catalog, Ordering, SupplyChain) thành các Microservices độc lập khi lượng truy cập tăng trưởng đột biến.

---

> **NGUYÊN TẮC THIẾT KẾ CỐT LÕI:**  
> *"An toàn dữ liệu và tính toàn vẹn của Sổ cái luôn được ưu tiên hàng đầu trước bất kỳ tính năng mới nào. Mỗi thay đổi mã nguồn phải luôn đi kèm bài test verification, file migration chuẩn mực và cập nhật đồng bộ vào tài liệu kiến trúc này."*
