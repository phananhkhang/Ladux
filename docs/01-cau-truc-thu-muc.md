# Cấu Trúc Thư Mục

Tài liệu này giải thích vai trò của từng thư mục/file quan trọng trong dự án.

## 1. Cấu Trúc Gốc

```text
Ladux/
├── .github/
├── backend/
├── docs/
├── frontend/
├── target/
├── .gitignore
├── design_guidelines.json
└── README.md
```

| Đường dẫn | Vai trò |
| --- | --- |
| `.github/` | Cấu hình GitHub nếu có CI/workflow |
| `backend/` | Spring Boot REST API |
| `frontend/` | React/Vite web app |
| `docs/` | Tài liệu dự án |
| `target/` | Output build Maven ở root hoặc artifact cũ |
| `design_guidelines.json` | Quy chuẩn thiết kế frontend |
| `README.md` | Tài liệu chính của dự án |

## 2. Backend

```text
backend/
├── Dockerfile
├── docker-compose.yml
├── mvnw
├── mvnw.cmd
├── pom.xml
├── database/
└── src/
```

| Đường dẫn | Vai trò |
| --- | --- |
| `pom.xml` | Khai báo Spring Boot, JPA, Security, JWT, Flyway, PostgreSQL |
| `Dockerfile` | Đóng gói backend thành container |
| `docker-compose.yml` | Chạy backend + PostgreSQL |
| `database/ladux_erd.png` | Ảnh ERD |
| `src/main/java` | Source code Java |
| `src/main/resources` | Config và migration |
| `src/test/java` | Test backend |

## 3. Backend Java Packages

```text
backend/src/main/java/org/akira/ladux/
├── LaduxApplication.java
├── config/
├── controller/
├── dto/
│   ├── request/
│   └── response/
├── exception/
├── model/
│   └── enums/
├── repository/
├── service/
│   └── impl/
└── utils/
```

### `LaduxApplication.java`

Entry point của Spring Boot app. File này bật:

- `@SpringBootApplication`
- `@EnableScheduling`

`@EnableScheduling` dùng cho job tự hủy đơn pending quá hạn.

### `config/`

Chứa cấu hình nền:

| File | Vai trò |
| --- | --- |
| `SecurityConfig.java` | CORS, CSRF, session stateless, route public/private, OAuth2 |
| `JwtFilter.java` | Đọc cookie JWT, validate token, set authentication |
| `OAuth2SuccessHandler.java` | Xử lý login Google thành công |
| `WebConfig.java` | Trailing slash handler, pageable default/max size, CORS MVC |

### `controller/`

Là tầng HTTP API. Controller nhận request từ frontend, validate input và gọi service.

Nhóm chính:

- `AuthController`
- `ProductController`
- `BrandController`
- `CategoryController`
- `CartController`
- `WishlistController`
- `OrderController`
- `PaymentController`
- `PaymentWebhookController`
- `CouponController`
- `ReviewController`
- `UserController`
- `UserAddressController`
- `OrderItemController`
- `OrderHistoryController`
- `ProductImageController`

### `dto/request/`

Các object đại diện body request frontend gửi lên.

Ví dụ:

- `LoginRequest`
- `RegisterRequest`
- `ProductRequest`
- `CartItemRequest`
- `OrderRequest`
- `OrderLineRequest`
- `PaymentCallbackRequest`
- `CouponApplyRequest`

### `dto/response/`

Các object backend trả về frontend.

Ví dụ:

- `UserResponse`
- `ProductResponse`
- `CartResponse`
- `OrderResponse`
- `PaymentCallbackResponse`
- `ReviewResponse`

### `model/`

Entity JPA map trực tiếp với bảng database.

Nhóm chính:

- Identity: `User`, `Role`, `UserPrincipal`
- Catalog: `Product`, `ProductImage`, `Brand`, `Category`
- Commerce: `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderHistory`
- Payment/discount: `Payment`, `Coupon`
- Engagement: `Review`, `Wishlist`
- Profile: `UserAddress`

### `repository/`

Spring Data JPA repository. Đây là nơi định nghĩa query database.

Các repository quan trọng:

- `UserRepository`
- `ProductRepository`
- `CartRepository`
- `OrderRepository`
- `PaymentRepository`
- `CouponRepository`
- `ReviewRepository`
- `WishlistRepository`

### `service/` và `service/impl/`

Service chứa nghiệp vụ. Interface nằm ở `service/`, implementation nằm ở `service/impl/`.

Các service quan trọng:

- `JwtService`
- `AuthCookieService`
- `MyUserDetailsService`
- `ProductServiceImpl`
- `CartServiceImpl`
- `OrderServiceImpl`
- `InventoryServiceImpl`
- `CouponRedemptionServiceImpl`
- `OrderStateMachineImpl`
- `OrderLifecycleService`
- `PaymentServiceImpl`
- `PaymentAttemptServiceImpl`

### `exception/`

Xử lý lỗi tập trung:

- `BusinessRuleException`
- `ResourceNotFoundException`
- `GlobalExceptionHandler`
- `ErrorResponse`

### `utils/`

Tiện ích dùng chung, hiện có `SlugUtils` để tạo slug sản phẩm/brand/category.

## 4. Backend Resources

```text
backend/src/main/resources/
├── application.properties
├── application-dev.properties
├── application-prod.properties
└── db/
    ├── migration/
    └── devdata/
```

| File/thư mục | Vai trò |
| --- | --- |
| `application.properties` | Config chung |
| `application-dev.properties` | Config profile dev |
| `application-prod.properties` | Config profile prod |
| `db/migration` | Migration production |
| `db/devdata` | Mock data chỉ dùng dev |

## 5. Frontend

```text
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── public/
└── src/
```

| Đường dẫn | Vai trò |
| --- | --- |
| `package.json` | Dependencies và script npm |
| `vite.config.ts` | Cấu hình Vite dev server |
| `tailwind.config.ts` | Cấu hình Tailwind |
| `src/main.tsx` | Entry point React |
| `src/App.tsx` | Khai báo routes |

## 6. Frontend Source

```text
frontend/src/
├── admin/
├── api/
├── components/
├── features/
├── lib/
├── pages/
├── types/
├── App.tsx
├── index.css
└── main.tsx
```

| Đường dẫn | Vai trò |
| --- | --- |
| `api/client.ts` | Axios instance, CSRF, API function wrappers |
| `types/api.ts` | TypeScript types match backend DTO |
| `lib/store.ts` | Zustand store cho auth/cart/wishlist/UI public |
| `admin/store.ts` | Zustand store cho admin auth |
| `components/` | Component public dùng chung |
| `components/ui/` | UI primitives |
| `pages/` | Storefront pages |
| `admin/pages/` | Admin pages |
| `admin/components/` | Admin layout/table/sidebar/topbar |
| `features/hero3d/` | Hero 3D trên frontend |

## 7. Quy Tắc Tìm File Theo Tính Năng

Ví dụ muốn hiểu cart:

```text
backend DB:
  V1__init_schema.sql -> carts, cart_items

backend code:
  model/Cart.java
  model/CartItem.java
  repository/CartRepository.java
  dto/request/CartItemRequest.java
  dto/request/CartQuantityRequest.java
  dto/response/CartResponse.java
  dto/response/CartItemResponse.java
  service/CartService.java
  service/impl/CartServiceImpl.java
  controller/CartController.java

frontend:
  api/client.ts -> Cart object
  lib/store.ts -> useCartStore
  components/CartDrawer.tsx
  pages/Checkout.tsx
```

Ví dụ muốn hiểu order:

```text
backend DB:
  orders
  order_items
  order_histories
  payments
  coupons
  products.stock_quantity

backend code:
  Order.java
  OrderItem.java
  OrderHistory.java
  Payment.java
  OrderRepository.java
  PaymentRepository.java
  OrderRequest.java
  OrderLineRequest.java
  OrderResponse.java
  OrderServiceImpl.java
  InventoryServiceImpl.java
  CouponRedemptionServiceImpl.java
  PaymentAttemptServiceImpl.java
  OrderStateMachineImpl.java
  OrderLifecycleService.java
  OrderController.java
  PaymentController.java
  PaymentWebhookController.java

frontend:
  api/client.ts -> Orders, Payments
  pages/Checkout.tsx
  pages/Orders.tsx
  pages/OrderDetail.tsx
  admin/pages/Orders.tsx
  admin/pages/Payments.tsx
```
