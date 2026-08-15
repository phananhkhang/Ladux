# Cấu Trúc Thư Mục Dự Án Ladux

Tài liệu này giải thích chi tiết vai trò của từng thư mục và file quan trọng trong toàn bộ repository của dự án Ladux.

---

## 1. Cấu Trúc Gốc (Root Directory)

```text
Ladux/
├── backend/                  # Mã nguồn Spring Boot REST API (Java 21)
├── frontend/                 # Mã nguồn React Single Page Application (TypeScript + Vite)
├── docs/                     # Tài liệu thiết kế kiến trúc, nghiệp vụ & vận hành
├── uploads/                  # Thư mục lưu trữ media & hình ảnh sản phẩm tĩnh
├── database/                 # Tài liệu & sơ đồ ERD cơ sở dữ liệu
├── .github/                  # Cấu hình GitHub Actions / CI workflows
├── .env.production.example   # Mẫu biến môi trường cho môi trường Production
├── docker-compose.yml        # Docker compose môi trường development
└── README.md                 # Tài liệu landing page của dự án
```

---

## 2. Cấu Trúc Backend (`backend/`)

```text
backend/
├── Dockerfile                     # Multi-stage Dockerfile đóng gói Spring Boot app
├── docker-compose.yml             # Khởi chạy PostgreSQL, Redis cho dev
├── docker-compose.prod.yml        # Khởi chạy stack Production (App + PostgreSQL + Redis + Caddy)
├── mvnw / mvnw.cmd                # Maven Wrapper
├── pom.xml                        # Khai báo dependencies: Spring Boot 4, Security, JPA, Redis, ShedLock, Bucket4j, Flyway, Testcontainers
└── src/
    ├── main/
    │   ├── java/org/akira/ladux/  # Source code Java chính
    │   └── resources/             # Configuration & Flyway migrations
    └── test/                      # Unit & Integration Tests (Testcontainers)
```

---

## 3. Chi Tiết Các Java Packages (`backend/src/main/java/org/akira/ladux/`)

```text
org.akira.ladux/
├── LaduxApplication.java          # Entry point Spring Boot application (@SpringBootApplication, @EnableScheduling, @EnableCaching)
├── config/                        # Cấu hình bảo mật, hạ tầng, rate limiting, distributed lock
├── controller/                    # Tầng REST Controllers (chia user & admin)
│   ├── admin/                     # Controller dành riêng cho quản trị viên (@PreAuthorize("hasRole('ADMIN')"))
│   └── user/                      # Controller dành cho người dùng và public
├── dto/                           # Data Transfer Objects (Request / Response / Internal DTOs)
│   ├── auth/                      # DTO đăng ký, đăng nhập, token refresh, OTP
│   ├── catalog/                   # DTO sản phẩm, biến thể, thương hiệu, danh mục
│   ├── inventory/                 # DTO nhà cung cấp, đơn nhập hàng (PO), sổ cái kho (StockMovement)
│   ├── order/                     # DTO tạo đơn, cập nhật trạng thái đơn hàng
│   ├── system/                    # DTO thanh toán, webhook, phản hồi chung
│   └── internal/                  # DTO luân chuyển nội bộ giữa các service (LineDraft, CouponRedemptionResult, ...)
├── exception/                     # Xử lý ngoại lệ tập trung (GlobalExceptionHandler & Custom Exceptions)
├── model/                         # JPA Entities tương ứng với các bảng trong PostgreSQL
│   └── enums/                     # Định nghĩa Enum (OrderStatus, PaymentProvider, StockMovementType, ...)
├── repository/                    # Spring Data JPA Repositories (với JPQL & Pessimistic Locks)
├── service/                       # Service Interfaces
│   ├── impl/                      # Service Implementations (Chứa toàn bộ logic nghiệp vụ cốt lõi)
│   ├── admin/                     # Interfaces dịch vụ quản trị
│   ├── chatbot/                   # Service AI / Chatbot
│   └── user/                      # Interfaces dịch vụ người dùng
└── utils/                         # Helper utilities (ClientIpUtils, VNPayUtils, SlugUtils, ...)
```

### 3.1 Gói `config/` (Cấu hình hệ thống & Bảo mật)
| File | Vai trò |
| :--- | :--- |
| `SecurityConfig.java` | Cấu hình 2 SecurityFilterChain: OAuth2 Code Flow chain & Stateless REST API Bearer JWT chain, phân quyền route, CORS |
| `JwtFilter.java` | Intercept request, trích xuất Bearer Token từ header `Authorization`, validate chữ ký, kiểm tra `token_version` và nạp `SecurityContext` |
| `EndpointRateLimitFilter.java` | Filter thực thi Token Bucket Rate Limiting cho các endpoint nhạy cảm (Login, Register, OTP, Order, Search, Chatbot) |
| `RateLimitConfig.java` | Khởi tạo Bean `ProxyManager` của Bucket4j kết nối Redis (`LettuceBasedProxyManager`) |
| `ShedLockConfig.java` | Cấu hình `LockProvider` sử dụng `JdbcTemplateLockProvider` trên bảng `shedlock` để phân tán scheduled jobs |
| `OAuth2SuccessHandler.java` | Xử lý redirect và tạo JWT sau khi đăng nhập Google OAuth2 thành công |
| `OAuth2FailureHandler.java` | Xử lý lỗi khi luồng đăng nhập OAuth2 thất bại |
| `WebConfig.java` | Cấu hình phân trang mặc định (`Pageable` default 12, max 50 items) và CORS |
| `JacksonConfig.java` | Cấu hình tuần tự hóa JSON thời gian theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`) |
| `ChatBotConfig.java` | Cấu hình Spring AI / RAG Chatbot |

### 3.2 Gói `model/` (JPA Entities)
- **Identity**: `User`, `Role`, `UserPrincipal`, `Customer`, `RefreshToken`, `EmailVerification`, `PhoneVerification`.
- **Catalog**: `Brand`, `Category`, `Color`, `Product`, `ProductVariant` (SKU, RAM, ROM, Giá, Tồn kho), `ProductImage`.
- **Commerce**: `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderHistory`, `Coupon`.
- **Thanh toán**: `Payment`.
- **Chuỗi cung ứng & Kho**: `Supplier`, `ProductSupplier`, `PurchaseOrder`, `PurchaseOrderItem`, `StockMovement` (Sổ cái kho).
- **Tương tác**: `Review`, `Wishlist`, `UserAddress`, `Notification`.

### 3.3 Gói `service/impl/` (Xử lý nghiệp vụ trọng tâm)
| Service Implementation | Trách nhiệm nghiệp vụ |
| :--- | :--- |
| `OrderServiceImpl.java` | Điều phối luồng checkout trong 1 transaction: trừ kho nguyên tử, chốt giá, áp coupon, khởi tạo payment, ghi sổ cái `SALE_OUT`, dọn giỏ hàng |
| `OrderStateMachineImpl.java` | Quản lý ma trận trạng thái đơn hàng; thực thi scheduled cron job hủy đơn `PENDING` quá hạn với `@SchedulerLock` |
| `OrderLifecycleService.java` | Điểm trung tâm xử lý hủy đơn (hoàn kho/coupon) và xác nhận đơn sau thanh toán thành công |
| `InventoryServiceImpl.java` | Thực hiện trừ kho nguyên tử (`deductStockAtomically`) trên biến thể sản phẩm, chặn overselling |
| `StockMovementServiceImpl.java` | Ghi nhận nhật ký bất biến vào sổ cái kho (`recordLedgerEntry` / `recordMovement`) cho mọi biến động |
| `PurchaseOrderServiceImpl.java` | Lập đơn nhập hàng, duyệt đơn và nhập kho (Goods Receipt) từng phần/toàn bộ |
| `PaymentWebhookServiceImpl.java` | Xử lý webhook IPN từ VNPay: xác thực HMAC-SHA512, đối soát số tiền, khóa payment theo `merchantTxnRef` bảo đảm Idempotency |
| `DistributedRateLimitService.java` | Quản lý các bucket giới hạn tần suất gọi API phân tán trên Redis (băm SHA-256 định danh) |
| `JwtService.java` / `RefreshTokenService.java` | Cấp phát, kiểm tra JWT access token, xoay vòng refresh token và quản lý `token_version` |

---

## 4. Tài Nguyên Backend (`backend/src/main/resources/`)

```text
backend/src/main/resources/
├── application.properties         # Cấu hình dùng chung (JPA, Jackson, Rate Limit defaults, VNPay)
├── application-dev.properties     # Cấu hình môi trường dev (Flyway devdata seed, logging DEBUG)
├── application-prod.properties    # Cấu hình môi trường production (Validate schema, Secure Cookie, Prod CORS)
└── db/
    ├── migration/                 # 42 Flyway SQL scripts (V1 -> V43) khởi tạo và tiến hóa database schema
    └── devdata/                   # Dữ liệu mẫu (mock data) phục vụ môi trường development
```

---

## 5. Cấu Trúc Frontend (`frontend/`)

```text
frontend/
├── package.json                   # Khai báo React 18, TypeScript, Tailwind CSS, Vite, Zustand, TanStack Query, Radix UI
├── vite.config.ts                 # Cấu hình Vite dev server & plugins
├── tsconfig.json                  # Cấu hình TypeScript compiler
├── index.html                     # HTML Template chính
└── src/
    ├── main.tsx                   # Entry point React ứng dụng
    ├── App.tsx                    # Định tuyến (React Router DOM v7)
    ├── services/                  # Tầng giao tiếp API Backend
    │   ├── apiClient.ts           # Axios client cấu hình Base URL, Bearer Token interceptor & tự động refresh phiên khi gặp 401
    │   ├── authTokens.ts          # Quản lý Access Token trong bộ nhớ
    │   ├── authService.ts         # API Đăng ký, đăng nhập, logout, OTP, refresh
    │   ├── productService.ts      # API Danh mục, sản phẩm, biến thể, tìm kiếm
    │   ├── cartService.ts         # API Giỏ hàng
    │   ├── orderService.ts        # API Đặt hàng, timeline đơn hàng, hủy đơn, đổi trả
    │   ├── paymentService.ts      # API Thanh toán, tạo URL VNPay, retry
    │   ├── purchaseOrderService.ts# API Quản lý đơn nhập hàng (PO)
    │   ├── supplierService.ts     # API Quản lý nhà cung cấp
    │   ├── stockMovementService.ts# API Sổ cái biến động kho
    │   └── chatbotService.ts      # API Trợ lý tư vấn AI
    ├── stores/ (hoặc lib/store.ts)# Zustand stores quản lý global state (Auth, Cart, Wishlist, Notifications, UI)
    ├── types/                     # TypeScript Interfaces khớp chính xác với DTO Backend
    ├── pages/                     # Giao diện Storefront cho Khách hàng (Home, Shop, ProductDetail, Checkout, Orders, ...)
    ├── admin/                     # Giao diện Quản trị Admin (Dashboard, Products, Orders, PO, Stock, Users, ...)
    ├── components/                # UI Components tái sử dụng (Header, Footer, ProductCard, Dialogs, ...)
    └── config/                    # Cấu hình biến môi trường (`env.apiBaseUrl`)
```

---

## 6. Quy Tắc Truy Vết Tính Năng Giữa Frontend & Backend

Khi cần kiểm tra hoặc mở rộng một tính năng, tra cứu theo sơ đồ liên kết:

### Ví dụ: Luồng Quản Lý Sổ Cái Kho (Stock Movement Ledger)
```text
Database:
  V22__add_customer_and_supply_chain.sql -> bảng stock_movements, purchase_orders

Backend Code:
  model/StockMovement.java
  model/enums/StockMovementType.java
  repository/StockMovementRepository.java
  dto/inventory/request/StockMovementRequest.java
  dto/inventory/response/StockMovementResponse.java
  service/StockMovementService.java
  service/impl/StockMovementServiceImpl.java
  controller/admin/AdminStockMovementController.java

Frontend Code:
  types/api.ts (StockMovementResponse)
  services/stockMovementService.ts
  admin/pages/InventoryLedger.tsx
```

### Ví dụ: Luồng Đặt Hàng Khóa Tồn Kho Nguyên Tử (Checkout)
```text
Database:
  orders, order_items, product_variants, coupons, payments, stock_movements

Backend Code:
  model/Order.java, model/ProductVariant.java, model/Payment.java
  repository/ProductVariantRepository.java (deductStockAtomically)
  repository/CartRepository.java (findByUserIdForUpdate)
  service/impl/InventoryServiceImpl.java (reserveStockAndPriceLines)
  service/impl/OrderServiceImpl.java (createOrder)
  service/impl/OrderStateMachineImpl.java (updateOrderStatus, expirePendingOrders)
  controller/user/OrderController.java

Frontend Code:
  services/orderService.ts
  pages/Checkout.tsx, pages/Orders.tsx, pages/OrderDetail.tsx
```
