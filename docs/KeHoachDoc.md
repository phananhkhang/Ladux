# 📖 Danh sách thứ tự đọc file Backend Ladux (Spring Boot)

> [!NOTE]
> Package gốc: `org.akira.ladux` — Đường dẫn viết tắt từ `backend/src/main/java/org/akira/ladux/` thành `…/`

---

## 🔴 Nhóm 1 — Entry Point & Cấu hình dự án (Đọc đầu tiên)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 1 | [pom.xml](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/pom.xml) | `backend/pom.xml` | Dependencies, plugins, version — hiểu stack dự án |
| 2 | [LaduxApplication.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/LaduxApplication.java) | `…/LaduxApplication.java` | Main class — điểm khởi chạy ứng dụng |
| 3 | [application.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/application.properties) | `resources/application.properties` | Cấu hình chung (DB, JWT, file upload…) |
| 4 | [application-dev.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/application-dev.properties) | `resources/application-dev.properties` | Cấu hình profile DEV |
| 5 | [application-prod.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/application-prod.properties) | `resources/application-prod.properties` | Cấu hình profile PROD |
| 6 | [.env](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/.env) | `backend/.env` | Biến môi trường (secrets, DB URL…) |
| 7 | [Dockerfile](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/Dockerfile) | `backend/Dockerfile` | Build image Docker |
| 8 | [docker-compose.yml](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/docker-compose.yml) | `backend/docker-compose.yml` | Orchestrate services (DB, app…) |

---

## 🟠 Nhóm 2 — Security & Config classes

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 9 | [SecurityConfig.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/SecurityConfig.java) | `…/config/SecurityConfig.java` | Cấu hình Spring Security, CORS, endpoint rules |
| 10 | [JwtFilter.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/JwtFilter.java) | `…/config/JwtFilter.java` | Filter xác thực JWT trên mỗi request |
| 11 | [OAuth2SuccessHandler.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/OAuth2SuccessHandler.java) | `…/config/OAuth2SuccessHandler.java` | Xử lý callback OAuth2 thành công |
| 12 | [LoginRateLimitFilter.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/LoginRateLimitFilter.java) | `…/config/LoginRateLimitFilter.java` | Chống brute-force login |
| 13 | [RateLimitConfig.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/RateLimitConfig.java) | `…/config/RateLimitConfig.java` | Cấu hình rate-limiter |
| 14 | [WebConfig.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/WebConfig.java) | `…/config/WebConfig.java` | Cấu hình Web MVC (CORS, static…) |
| 15 | [JacksonConfig.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/JacksonConfig.java) | `…/config/JacksonConfig.java` | Cấu hình JSON serialization |
| 16 | [ShedLockConfig.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/config/ShedLockConfig.java) | `…/config/ShedLockConfig.java` | Distributed lock cho scheduled tasks |

---

## 🟡 Nhóm 3 — Enums (Đọc trước Model để hiểu trạng thái)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 17 | [RoleName.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/RoleName.java) | `…/model/enums/RoleName.java` | Enum vai trò: ADMIN, USER… |
| 18 | [OrderStatus.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/OrderStatus.java) | `…/model/enums/OrderStatus.java` | Trạng thái đơn hàng |
| 19 | [PaymentStatus.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/PaymentStatus.java) | `…/model/enums/PaymentStatus.java` | Trạng thái thanh toán |
| 20 | [PaymentProvider.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/PaymentProvider.java) | `…/model/enums/PaymentProvider.java` | Nhà cung cấp thanh toán (VNPay, MoMo…) |
| 21 | [DiscountType.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/DiscountType.java) | `…/model/enums/DiscountType.java` | Loại giảm giá (%, cố định…) |
| 22 | [CustomerLevel.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/CustomerLevel.java) | `…/model/enums/CustomerLevel.java` | Hạng khách hàng |
| 23 | [PurchaseOrderStatus.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/PurchaseOrderStatus.java) | `…/model/enums/PurchaseOrderStatus.java` | Trạng thái đơn nhập hàng |
| 24 | [StockMovementType.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/StockMovementType.java) | `…/model/enums/StockMovementType.java` | Loại biến động tồn kho (IN/OUT) |
| 25 | [StockReferenceType.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/enums/StockReferenceType.java) | `…/model/enums/StockReferenceType.java` | Tham chiếu nguồn biến động kho |

---

## 🟢 Nhóm 4 — Model / Entity (Cốt lõi domain)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 26 | [User.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/User.java) | `…/model/User.java` | Entity người dùng |
| 27 | [Role.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Role.java) | `…/model/Role.java` | Entity quyền (Role) |
| 28 | [UserPrincipal.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/UserPrincipal.java) | `…/model/UserPrincipal.java` | Wrapper UserDetails cho Spring Security |
| 29 | [RefreshToken.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/RefreshToken.java) | `…/model/RefreshToken.java` | Entity refresh token |
| 30 | [UserAddress.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/UserAddress.java) | `…/model/UserAddress.java` | Địa chỉ giao hàng |
| 31 | [Customer.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Customer.java) | `…/model/Customer.java` | Entity khách hàng (CRM) |
| 32 | [Product.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Product.java) | `…/model/Product.java` | Entity sản phẩm |
| 33 | [ProductImage.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/ProductImage.java) | `…/model/ProductImage.java` | Ảnh sản phẩm |
| 34 | [Category.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Category.java) | `…/model/Category.java` | Danh mục sản phẩm |
| 35 | [Brand.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Brand.java) | `…/model/Brand.java` | Thương hiệu |
| 36 | [Cart.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Cart.java) | `…/model/Cart.java` | Giỏ hàng |
| 37 | [CartItem.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/CartItem.java) | `…/model/CartItem.java` | Item trong giỏ hàng |
| 38 | [Order.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Order.java) | `…/model/Order.java` | Entity đơn hàng |
| 39 | [OrderItem.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/OrderItem.java) | `…/model/OrderItem.java` | Chi tiết từng dòng đơn hàng |
| 40 | [OrderHistory.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/OrderHistory.java) | `…/model/OrderHistory.java` | Lịch sử trạng thái đơn hàng |
| 41 | [Payment.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Payment.java) | `…/model/Payment.java` | Entity thanh toán |
| 42 | [Coupon.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Coupon.java) | `…/model/Coupon.java` | Mã giảm giá |
| 43 | [Review.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Review.java) | `…/model/Review.java` | Đánh giá sản phẩm |
| 44 | [Wishlist.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Wishlist.java) | `…/model/Wishlist.java` | Danh sách yêu thích |
| 45 | [Supplier.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/Supplier.java) | `…/model/Supplier.java` | Nhà cung cấp |
| 46 | [ProductSupplier.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/ProductSupplier.java) | `…/model/ProductSupplier.java` | Quan hệ sản phẩm ↔ nhà cung cấp |
| 47 | [PurchaseOrder.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/PurchaseOrder.java) | `…/model/PurchaseOrder.java` | Đơn nhập hàng (PO) |
| 48 | [PurchaseOrderItem.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/PurchaseOrderItem.java) | `…/model/PurchaseOrderItem.java` | Dòng chi tiết đơn nhập |
| 49 | [StockMovement.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/model/StockMovement.java) | `…/model/StockMovement.java` | Biến động kho (nhập/xuất) |

---

## 🔵 Nhóm 5 — Repository (Data Access)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 50 | [UserRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/UserRepository.java) | `…/repository/UserRepository.java` | JPA repo User |
| 51 | [RoleRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/RoleRepository.java) | `…/repository/RoleRepository.java` | JPA repo Role |
| 52 | [RefreshTokenRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/RefreshTokenRepository.java) | `…/repository/RefreshTokenRepository.java` | JPA repo RefreshToken |
| 53 | [UserAddressRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/UserAddressRepository.java) | `…/repository/UserAddressRepository.java` | JPA repo UserAddress |
| 54 | [CustomerRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/CustomerRepository.java) | `…/repository/CustomerRepository.java` | JPA repo Customer |
| 55 | [ProductRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/ProductRepository.java) | `…/repository/ProductRepository.java` | JPA repo Product |
| 56 | [ProductImageRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/ProductImageRepository.java) | `…/repository/ProductImageRepository.java` | JPA repo ProductImage |
| 57 | [CategoryRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/CategoryRepository.java) | `…/repository/CategoryRepository.java` | JPA repo Category |
| 58 | [BrandRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/BrandRepository.java) | `…/repository/BrandRepository.java` | JPA repo Brand |
| 59 | [CartRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/CartRepository.java) | `…/repository/CartRepository.java` | JPA repo Cart |
| 60 | [CartItemRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/CartItemRepository.java) | `…/repository/CartItemRepository.java` | JPA repo CartItem |
| 61 | [OrderRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/OrderRepository.java) | `…/repository/OrderRepository.java` | JPA repo Order |
| 62 | [OrderItemRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/OrderItemRepository.java) | `…/repository/OrderItemRepository.java` | JPA repo OrderItem |
| 63 | [OrderHistoryRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/OrderHistoryRepository.java) | `…/repository/OrderHistoryRepository.java` | JPA repo OrderHistory |
| 64 | [PaymentRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/PaymentRepository.java) | `…/repository/PaymentRepository.java` | JPA repo Payment |
| 65 | [CouponRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/CouponRepository.java) | `…/repository/CouponRepository.java` | JPA repo Coupon |
| 66 | [ReviewRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/ReviewRepository.java) | `…/repository/ReviewRepository.java` | JPA repo Review |
| 67 | [WishlistRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/WishlistRepository.java) | `…/repository/WishlistRepository.java` | JPA repo Wishlist |
| 68 | [SupplierRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/SupplierRepository.java) | `…/repository/SupplierRepository.java` | JPA repo Supplier |
| 69 | [ProductSupplierRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/ProductSupplierRepository.java) | `…/repository/ProductSupplierRepository.java` | JPA repo ProductSupplier |
| 70 | [PurchaseOrderRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/PurchaseOrderRepository.java) | `…/repository/PurchaseOrderRepository.java` | JPA repo PurchaseOrder |
| 71 | [PurchaseOrderItemRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/PurchaseOrderItemRepository.java) | `…/repository/PurchaseOrderItemRepository.java` | JPA repo PurchaseOrderItem |
| 72 | [StockMovementRepository.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/repository/StockMovementRepository.java) | `…/repository/StockMovementRepository.java` | JPA repo StockMovement |

---

## 🟣 Nhóm 6 — Service Interfaces (Đọc interface trước impl)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 73 | [JwtService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/JwtService.java) | `…/service/JwtService.java` | Tạo/xác thực JWT token |
| 74 | [MyUserDetailsService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/MyUserDetailsService.java) | `…/service/MyUserDetailsService.java` | Load user cho Spring Security |
| 75 | [AuthCookieService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/AuthCookieService.java) | `…/service/AuthCookieService.java` | Quản lý cookie xác thực |
| 76 | [RefreshTokenService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/RefreshTokenService.java) | `…/service/RefreshTokenService.java` | Logic refresh token |
| 77 | [UserService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/UserService.java) | `…/service/UserService.java` | Interface quản lý User |
| 78 | [UserAddressService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/UserAddressService.java) | `…/service/UserAddressService.java` | Interface quản lý địa chỉ |
| 79 | [CustomerService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/CustomerService.java) | `…/service/CustomerService.java` | Interface quản lý khách hàng |
| 80 | [ProductService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/ProductService.java) | `…/service/ProductService.java` | Interface quản lý sản phẩm |
| 81 | [ProductImageService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/ProductImageService.java) | `…/service/ProductImageService.java` | Interface ảnh sản phẩm |
| 82 | [CategoryService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/CategoryService.java) | `…/service/CategoryService.java` | Interface danh mục |
| 83 | [BrandService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/BrandService.java) | `…/service/BrandService.java` | Interface thương hiệu |
| 84 | [CartService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/CartService.java) | `…/service/CartService.java` | Interface giỏ hàng |
| 85 | [OrderService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/OrderService.java) | `…/service/OrderService.java` | Interface đơn hàng |
| 86 | [OrderItemService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/OrderItemService.java) | `…/service/OrderItemService.java` | Interface dòng đơn hàng |
| 87 | [OrderHistoryService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/OrderHistoryService.java) | `…/service/OrderHistoryService.java` | Interface lịch sử đơn |
| 88 | [OrderStateMachine.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/OrderStateMachine.java) | `…/service/OrderStateMachine.java` | Interface state machine trạng thái đơn |
| 89 | [OrderLifecycleService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/OrderLifecycleService.java) | `…/service/OrderLifecycleService.java` | Orchestrator vòng đời đơn hàng |
| 90 | [PricingService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/PricingService.java) | `…/service/PricingService.java` | Interface tính giá |
| 91 | [PaymentService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/PaymentService.java) | `…/service/PaymentService.java` | Interface thanh toán |
| 92 | [PaymentAttemptService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/PaymentAttemptService.java) | `…/service/PaymentAttemptService.java` | Interface lần thanh toán |
| 93 | [PaymentWebhookService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/PaymentWebhookService.java) | `…/service/PaymentWebhookService.java` | Interface webhook thanh toán |
| 94 | [CouponService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/CouponService.java) | `…/service/CouponService.java` | Interface mã giảm giá |
| 95 | [CouponRedemptionService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/CouponRedemptionService.java) | `…/service/CouponRedemptionService.java` | Interface đổi coupon |
| 96 | [ReviewService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/ReviewService.java) | `…/service/ReviewService.java` | Interface đánh giá |
| 97 | [WishlistService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/WishlistService.java) | `…/service/WishlistService.java` | Interface wishlist |
| 98 | [FileStorageService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/FileStorageService.java) | `…/service/FileStorageService.java` | Interface upload file |
| 99 | [InventoryService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/InventoryService.java) | `…/service/InventoryService.java` | Interface tồn kho |
| 100 | [StockMovementService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/StockMovementService.java) | `…/service/StockMovementService.java` | Interface biến động kho |
| 101 | [SupplierService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/SupplierService.java) | `…/service/SupplierService.java` | Interface nhà cung cấp |
| 102 | [ProductSupplierService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/ProductSupplierService.java) | `…/service/ProductSupplierService.java` | Interface product-supplier |
| 103 | [PurchaseOrderService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/PurchaseOrderService.java) | `…/service/PurchaseOrderService.java` | Interface đơn nhập hàng |

---

## 🟤 Nhóm 7 — Service Implementations (Logic nghiệp vụ chính)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 104 | [UserServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/UserServiceImpl.java) | `…/service/impl/UserServiceImpl.java` | Impl quản lý user |
| 105 | [UserAddressServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/UserAddressServiceImpl.java) | `…/service/impl/UserAddressServiceImpl.java` | Impl địa chỉ |
| 106 | [CustomerServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/CustomerServiceImpl.java) | `…/service/impl/CustomerServiceImpl.java` | Impl khách hàng |
| 107 | [ProductServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/ProductServiceImpl.java) | `…/service/impl/ProductServiceImpl.java` | Impl sản phẩm |
| 108 | [ProductImageServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java) | `…/service/impl/ProductImageServiceImpl.java` | Impl ảnh sản phẩm |
| 109 | [CategoryServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/CategoryServiceImpl.java) | `…/service/impl/CategoryServiceImpl.java` | Impl danh mục |
| 110 | [BrandServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/BrandServiceImpl.java) | `…/service/impl/BrandServiceImpl.java` | Impl thương hiệu |
| 111 | [CartServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/CartServiceImpl.java) | `…/service/impl/CartServiceImpl.java` | Impl giỏ hàng |
| 112 | [OrderServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/OrderServiceImpl.java) | `…/service/impl/OrderServiceImpl.java` | ⭐ Impl đơn hàng — **logic lõi** |
| 113 | [OrderItemServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java) | `…/service/impl/OrderItemServiceImpl.java` | Impl dòng đơn hàng |
| 114 | [OrderHistoryServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/OrderHistoryServiceImpl.java) | `…/service/impl/OrderHistoryServiceImpl.java` | Impl lịch sử đơn |
| 115 | [OrderStateMachineImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/OrderStateMachineImpl.java) | `…/service/impl/OrderStateMachineImpl.java` | ⭐ Impl state machine đơn hàng |
| 116 | [PricingServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/PricingServiceImpl.java) | `…/service/impl/PricingServiceImpl.java` | ⭐ Impl tính giá/coupon |
| 117 | [PaymentServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/PaymentServiceImpl.java) | `…/service/impl/PaymentServiceImpl.java` | ⭐ Impl thanh toán |
| 118 | [PaymentAttemptServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/PaymentAttemptServiceImpl.java) | `…/service/impl/PaymentAttemptServiceImpl.java` | Impl lần thanh toán |
| 119 | [PaymentWebhookServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/PaymentWebhookServiceImpl.java) | `…/service/impl/PaymentWebhookServiceImpl.java` | ⭐ Impl xử lý webhook thanh toán |
| 120 | [CouponServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/CouponServiceImpl.java) | `…/service/impl/CouponServiceImpl.java` | Impl mã giảm giá |
| 121 | [CouponRedemptionServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/CouponRedemptionServiceImpl.java) | `…/service/impl/CouponRedemptionServiceImpl.java` | Impl đổi coupon |
| 122 | [ReviewServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/ReviewServiceImpl.java) | `…/service/impl/ReviewServiceImpl.java` | Impl đánh giá |
| 123 | [WishlistServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/WishlistServiceImpl.java) | `…/service/impl/WishlistServiceImpl.java` | Impl wishlist |
| 124 | [FileStorageServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/FileStorageServiceImpl.java) | `…/service/impl/FileStorageServiceImpl.java` | Impl upload file |
| 125 | [InventoryServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/InventoryServiceImpl.java) | `…/service/impl/InventoryServiceImpl.java` | Impl tồn kho |
| 126 | [StockMovementServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/StockMovementServiceImpl.java) | `…/service/impl/StockMovementServiceImpl.java` | Impl biến động kho |
| 127 | [SupplierServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/SupplierServiceImpl.java) | `…/service/impl/SupplierServiceImpl.java` | Impl nhà cung cấp |
| 128 | [ProductSupplierServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/ProductSupplierServiceImpl.java) | `…/service/impl/ProductSupplierServiceImpl.java` | Impl product-supplier |
| 129 | [PurchaseOrderServiceImpl.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/service/impl/PurchaseOrderServiceImpl.java) | `…/service/impl/PurchaseOrderServiceImpl.java` | Impl đơn nhập hàng |

---

## ⚪ Nhóm 8 — DTO (Request / Response)

### Request DTOs
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 130 | [LoginRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/LoginRequest.java) | `…/dto/request/LoginRequest.java` | Request đăng nhập |
| 131 | [RegisterRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/RegisterRequest.java) | `…/dto/request/RegisterRequest.java` | Request đăng ký |
| 132 | [UserRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/UserRequest.java) | `…/dto/request/UserRequest.java` | Request tạo/sửa user |
| 133 | [UserProfileUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/UserProfileUpdateRequest.java) | `…/dto/request/UserProfileUpdateRequest.java` | Request cập nhật profile |
| 134 | [UserAdminUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/UserAdminUpdateRequest.java) | `…/dto/request/UserAdminUpdateRequest.java` | Admin cập nhật user |
| 135 | [UserAddressRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/UserAddressRequest.java) | `…/dto/request/UserAddressRequest.java` | Request địa chỉ |
| 136 | [CustomerUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CustomerUpdateRequest.java) | `…/dto/request/CustomerUpdateRequest.java` | Request cập nhật customer |
| 137 | [ProductRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/ProductRequest.java) | `…/dto/request/ProductRequest.java` | Request tạo/sửa sản phẩm |
| 138 | [CategoryRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CategoryRequest.java) | `…/dto/request/CategoryRequest.java` | Request danh mục |
| 139 | [BrandRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/BrandRequest.java) | `…/dto/request/BrandRequest.java` | Request thương hiệu |
| 140 | [CartItemRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CartItemRequest.java) | `…/dto/request/CartItemRequest.java` | Request thêm vào giỏ |
| 141 | [CartQuantityRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CartQuantityRequest.java) | `…/dto/request/CartQuantityRequest.java` | Request cập nhật số lượng |
| 142 | [OrderRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/OrderRequest.java) | `…/dto/request/OrderRequest.java` | Request tạo đơn |
| 143 | [OrderLineRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/OrderLineRequest.java) | `…/dto/request/OrderLineRequest.java` | Request dòng đơn |
| 144 | [OrderStatusUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/OrderStatusUpdateRequest.java) | `…/dto/request/OrderStatusUpdateRequest.java` | Request cập nhật trạng thái |
| 145 | [PaymentCreateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PaymentCreateRequest.java) | `…/dto/request/PaymentCreateRequest.java` | Request tạo payment |
| 146 | [PaymentCallbackRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PaymentCallbackRequest.java) | `…/dto/request/PaymentCallbackRequest.java` | Request callback thanh toán |
| 147 | [CouponAdminRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CouponAdminRequest.java) | `…/dto/request/CouponAdminRequest.java` | Admin tạo coupon |
| 148 | [CouponApplyRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/CouponApplyRequest.java) | `…/dto/request/CouponApplyRequest.java` | Request áp dụng coupon |
| 149 | [ReviewCreateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/ReviewCreateRequest.java) | `…/dto/request/ReviewCreateRequest.java` | Request tạo review |
| 150 | [ReviewUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/ReviewUpdateRequest.java) | `…/dto/request/ReviewUpdateRequest.java` | Request sửa review |
| 151 | [WishlistRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/WishlistRequest.java) | `…/dto/request/WishlistRequest.java` | Request wishlist |
| 152 | [StockMovementRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/StockMovementRequest.java) | `…/dto/request/StockMovementRequest.java` | Request biến động kho |
| 153 | [SupplierRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/SupplierRequest.java) | `…/dto/request/SupplierRequest.java` | Request nhà cung cấp |
| 154 | [ProductSupplierRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/ProductSupplierRequest.java) | `…/dto/request/ProductSupplierRequest.java` | Request product-supplier |
| 155 | [PurchaseOrderCreateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PurchaseOrderCreateRequest.java) | `…/dto/request/PurchaseOrderCreateRequest.java` | Request tạo PO |
| 156 | [PurchaseOrderItemRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PurchaseOrderItemRequest.java) | `…/dto/request/PurchaseOrderItemRequest.java` | Request dòng PO |
| 157 | [PurchaseOrderReceiveRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PurchaseOrderReceiveRequest.java) | `…/dto/request/PurchaseOrderReceiveRequest.java` | Request nhận hàng PO |
| 158 | [PurchaseOrderStatusUpdateRequest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/request/PurchaseOrderStatusUpdateRequest.java) | `…/dto/request/PurchaseOrderStatusUpdateRequest.java` | Request cập nhật PO |

### Internal DTOs
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 159 | [LineDraft.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/LineDraft.java) | `…/dto/LineDraft.java` | DTO nội bộ — dòng nháp đơn |
| 160 | [CouponRedemptionResult.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/CouponRedemptionResult.java) | `…/dto/CouponRedemptionResult.java` | DTO kết quả đổi coupon |
| 161 | [PaymentWebhookResult.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/PaymentWebhookResult.java) | `…/dto/PaymentWebhookResult.java` | DTO kết quả webhook |

### Response DTOs
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 162 | [UserResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/UserResponse.java) | `…/dto/response/UserResponse.java` | Response user |
| 163 | [UserAddressResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/UserAddressResponse.java) | `…/dto/response/UserAddressResponse.java` | Response địa chỉ |
| 164 | [CustomerResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CustomerResponse.java) | `…/dto/response/CustomerResponse.java` | Response customer |
| 165 | [ProductResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/ProductResponse.java) | `…/dto/response/ProductResponse.java` | Response sản phẩm |
| 166 | [ProductImageResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/ProductImageResponse.java) | `…/dto/response/ProductImageResponse.java` | Response ảnh sản phẩm |
| 167 | [CategoryResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CategoryResponse.java) | `…/dto/response/CategoryResponse.java` | Response danh mục |
| 168 | [BrandResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/BrandResponse.java) | `…/dto/response/BrandResponse.java` | Response thương hiệu |
| 169 | [CartResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CartResponse.java) | `…/dto/response/CartResponse.java` | Response giỏ hàng |
| 170 | [CartItemResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CartItemResponse.java) | `…/dto/response/CartItemResponse.java` | Response item giỏ |
| 171 | [OrderResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/OrderResponse.java) | `…/dto/response/OrderResponse.java` | Response đơn hàng |
| 172 | [OrderItemResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/OrderItemResponse.java) | `…/dto/response/OrderItemResponse.java` | Response dòng đơn |
| 173 | [OrderHistoryResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/OrderHistoryResponse.java) | `…/dto/response/OrderHistoryResponse.java` | Response lịch sử |
| 174 | [PaymentCallbackResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/PaymentCallbackResponse.java) | `…/dto/response/PaymentCallbackResponse.java` | Response callback |
| 175 | [CouponResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CouponResponse.java) | `…/dto/response/CouponResponse.java` | Response coupon |
| 176 | [CouponApplyResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/CouponApplyResponse.java) | `…/dto/response/CouponApplyResponse.java` | Response áp dụng coupon |
| 177 | [ReviewResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/ReviewResponse.java) | `…/dto/response/ReviewResponse.java` | Response review |
| 178 | [WishlistResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/WishlistResponse.java) | `…/dto/response/WishlistResponse.java` | Response wishlist |
| 179 | [UploadUrlResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/UploadUrlResponse.java) | `…/dto/response/UploadUrlResponse.java` | Response URL upload |
| 180 | [StockMovementResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/StockMovementResponse.java) | `…/dto/response/StockMovementResponse.java` | Response biến động kho |
| 181 | [SupplierResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/SupplierResponse.java) | `…/dto/response/SupplierResponse.java` | Response nhà cung cấp |
| 182 | [ProductSupplierResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/ProductSupplierResponse.java) | `…/dto/response/ProductSupplierResponse.java` | Response product-supplier |
| 183 | [PurchaseOrderResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/PurchaseOrderResponse.java) | `…/dto/response/PurchaseOrderResponse.java` | Response PO |
| 184 | [PurchaseOrderItemResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/dto/response/PurchaseOrderItemResponse.java) | `…/dto/response/PurchaseOrderItemResponse.java` | Response dòng PO |

---

## 🔷 Nhóm 9 — Controller (API Layer)

### Auth
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 185 | [AuthController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/AuthController.java) | `…/controller/AuthController.java` | Login, register, refresh token |

### User-facing Controllers
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 186 | [UserController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/UserController.java) | `…/controller/user/UserController.java` | API user profile |
| 187 | [UserAddressController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/UserAddressController.java) | `…/controller/user/UserAddressController.java` | API địa chỉ user |
| 188 | [ProductController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/ProductController.java) | `…/controller/user/ProductController.java` | API duyệt sản phẩm |
| 189 | [ProductImageController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/ProductImageController.java) | `…/controller/user/ProductImageController.java` | API ảnh sản phẩm |
| 190 | [BrandController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/BrandController.java) | `…/controller/user/BrandController.java` | API thương hiệu |
| 191 | [CategoryController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/CategoryController.java) | `…/controller/user/CategoryController.java` | API danh mục |
| 192 | [CartController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/CartController.java) | `…/controller/user/CartController.java` | API giỏ hàng |
| 193 | [OrderController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/OrderController.java) | `…/controller/user/OrderController.java` | API đơn hàng user |
| 194 | [OrderHistoryController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/OrderHistoryController.java) | `…/controller/user/OrderHistoryController.java` | API lịch sử đơn |
| 195 | [PaymentController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/PaymentController.java) | `…/controller/user/PaymentController.java` | API thanh toán user |
| 196 | [PaymentWebhookController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/PaymentWebhookController.java) | `…/controller/user/PaymentWebhookController.java` | Webhook endpoint |
| 197 | [CouponController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/CouponController.java) | `…/controller/user/CouponController.java` | API coupon user |
| 198 | [ReviewController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/ReviewController.java) | `…/controller/user/ReviewController.java` | API đánh giá |
| 199 | [WishlistController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/user/WishlistController.java) | `…/controller/user/WishlistController.java` | API wishlist |

### Admin Controllers
| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 200 | [AdminUserController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminUserController.java) | `…/controller/admin/AdminUserController.java` | Admin quản lý user |
| 201 | [AdminUserAddressController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminUserAddressController.java) | `…/controller/admin/AdminUserAddressController.java` | Admin quản lý địa chỉ |
| 202 | [AdminCustomerController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminCustomerController.java) | `…/controller/admin/AdminCustomerController.java` | Admin quản lý customer |
| 203 | [AdminProductController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminProductController.java) | `…/controller/admin/AdminProductController.java` | Admin quản lý sản phẩm |
| 204 | [AdminProductImageController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java) | `…/controller/admin/AdminProductImageController.java` | Admin quản lý ảnh SP |
| 205 | [AdminCategoryController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminCategoryController.java) | `…/controller/admin/AdminCategoryController.java` | Admin quản lý danh mục |
| 206 | [AdminBrandController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminBrandController.java) | `…/controller/admin/AdminBrandController.java` | Admin quản lý thương hiệu |
| 207 | [AdminOrderController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminOrderController.java) | `…/controller/admin/AdminOrderController.java` | Admin quản lý đơn hàng |
| 208 | [AdminOrderItemController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminOrderItemController.java) | `…/controller/admin/AdminOrderItemController.java` | Admin quản lý dòng đơn |
| 209 | [AdminOrderHistoryController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminOrderHistoryController.java) | `…/controller/admin/AdminOrderHistoryController.java` | Admin lịch sử đơn |
| 210 | [AdminPaymentController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminPaymentController.java) | `…/controller/admin/AdminPaymentController.java` | Admin thanh toán |
| 211 | [AdminCouponController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminCouponController.java) | `…/controller/admin/AdminCouponController.java` | Admin quản lý coupon |
| 212 | [AdminReviewController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminReviewController.java) | `…/controller/admin/AdminReviewController.java` | Admin quản lý review |
| 213 | [AdminSupplierController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminSupplierController.java) | `…/controller/admin/AdminSupplierController.java` | Admin nhà cung cấp |
| 214 | [AdminProductSupplierController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminProductSupplierController.java) | `…/controller/admin/AdminProductSupplierController.java` | Admin product-supplier |
| 215 | [AdminPurchaseOrderController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminPurchaseOrderController.java) | `…/controller/admin/AdminPurchaseOrderController.java` | Admin đơn nhập hàng |
| 216 | [AdminStockMovementController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/controller/admin/AdminStockMovementController.java) | `…/controller/admin/AdminStockMovementController.java` | Admin biến động kho |

---

## 🟫 Nhóm 10 — Exception & Utils

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 217 | [GlobalExceptionHandler.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/exception/GlobalExceptionHandler.java) | `…/exception/GlobalExceptionHandler.java` | @ControllerAdvice — xử lý lỗi tập trung |
| 218 | [ErrorResponse.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/exception/ErrorResponse.java) | `…/exception/ErrorResponse.java` | DTO lỗi trả về client |
| 219 | [ResourceNotFoundException.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/exception/ResourceNotFoundException.java) | `…/exception/ResourceNotFoundException.java` | Exception 404 |
| 220 | [BusinessRuleException.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/exception/BusinessRuleException.java) | `…/exception/BusinessRuleException.java` | Exception vi phạm business rule |
| 221 | [InsufficientStockException.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/exception/InsufficientStockException.java) | `…/exception/InsufficientStockException.java` | Exception hết hàng |
| 222 | [SlugUtils.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/java/org/akira/ladux/utils/SlugUtils.java) | `…/utils/SlugUtils.java` | Utility tạo slug URL |

---

## 📊 Nhóm 11 — Database Migrations (Flyway)

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 223 | [V1__init_schema.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V1__init_schema.sql) | `resources/db/migration/V1__init_schema.sql` | ⭐ Schema khởi tạo — đọc đầu tiên |
| 224 | [V2__add_hot_path_indexes.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V2__add_hot_path_indexes.sql) | `…/V2__add_hot_path_indexes.sql` | Index hiệu năng |
| 225 | [V3__insert_mock_data.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/devdata/V3__insert_mock_data.sql) | `…/devdata/V3__insert_mock_data.sql` | Dữ liệu mẫu (devdata) |
| 226 | [V4__fix_seed_user_passwords.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V4__fix_seed_user_passwords.sql) | `…/V4__fix_seed_user_passwords.sql` | Fix password seed |
| 227 | [V5__disable_seed_user_passwords.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V5__disable_seed_user_passwords.sql) | `…/V5__disable_seed_user_passwords.sql` | Disable seed passwords |
| 228 | [V6__set_dev_admin_bcrypt_password.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V6__set_dev_admin_bcrypt_password.sql) | `…/V6__set_dev_admin_bcrypt_password.sql` | Set bcrypt admin pw |
| 229 | [V7__add_payment_gateway_transaction_no_unique.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V7__add_payment_gateway_transaction_no_unique.sql) | `…/V7__…_unique.sql` | Unique constraint payment |
| 230 | [V8__add_updated_at_to_core_tables.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V8__add_updated_at_to_core_tables.sql) | `…/V8__…_core_tables.sql` | Thêm updated_at |
| 231 | [V9__add_stock_quantity_check.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V9__add_stock_quantity_check.sql) | `…/V9__…_check.sql` | Check constraint tồn kho |
| 232 | [V10__harden_category_delete_constraints.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V10__harden_category_delete_constraints.sql) | `…/V10__…_constraints.sql` | Constraint xóa danh mục |
| 233 | [V11__create_shedlock_table.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V11__create_shedlock_table.sql) | `…/V11__…_shedlock.sql` | Bảng ShedLock |
| 234 | [V12__enable_pg_trgm_extension.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V12__enable_pg_trgm_extension.sql) | `…/V12__…_trgm.sql` | Extension trigram Postgres |
| 235 | [V13__add_trigram_index_on_products.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V13__add_trigram_index_on_products.sql) | `…/V13__…_products.sql` | Index tìm kiếm fuzzy |
| 236 | [V14__rename_updated_at_to_update_at.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V14__rename_updated_at_to_update_at.sql) | `…/V14__rename_updated_at.sql` | Đổi tên cột |
| 237 | [V15__add_created_at_to_coupons.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V15__add_created_at_to_coupons.sql) | `…/V15__…_coupons.sql` | Thêm created_at coupon |
| 238 | [V16__add_rating_check_constraint_on_reviews.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V16__add_rating_check_constraint_on_reviews.sql) | `…/V16__…_reviews.sql` | Check constraint rating |
| 239 | [V17__add_user_id_to_order_histories.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V17__add_user_id_to_order_histories.sql) | `…/V17__…_histories.sql` | Thêm user_id lịch sử đơn |
| 240 | [V18__drop_wishlists_added_at.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V18__drop_wishlists_added_at.sql) | `…/V18__drop_wishlists.sql` | Bỏ cột added_at wishlist |
| 241 | [V19__fix_trigram_index_to_lower_name.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V19__fix_trigram_index_to_lower_name.sql) | `…/V19__fix_trigram.sql` | Fix trigram index |
| 242 | [V20__create_refresh_tokens.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V20__create_refresh_tokens.sql) | `…/V20__refresh_tokens.sql` | Bảng refresh token |
| 243 | [V21__add_token_version_to_users.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V21__add_token_version_to_users.sql) | `…/V21__token_version.sql` | Token versioning |
| 244 | [V22__add_customer_and_supply_chain.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V22__add_customer_and_supply_chain.sql) | `…/V22__customer_supply.sql` | ⭐ Schema supply chain |
| 245 | [V23__insert_supply_chain_mock_data.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V23__insert_supply_chain_mock_data.sql) | `…/V23__supply_mock.sql` | Mock data supply chain |
| 246 | [V24__link_local_product_images.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V24__link_local_product_images.sql) | `…/V24__product_images.sql` | Link ảnh local |
| 247 | [V25__update_category_images.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V25__update_category_images.sql) | `…/V25__category_images.sql` | Cập nhật ảnh danh mục |
| 248 | [V26__add_image_to_categories.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V26__add_image_to_categories.sql) | `…/V26__add_image_cat.sql` | Thêm cột ảnh category |
| 249 | [V27__drop_brand_logo_url.sql](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/main/resources/db/migration/V27__drop_brand_logo_url.sql) | `…/V27__drop_brand_logo.sql` | Bỏ cột logo thương hiệu |

---

## 🧪 Nhóm 12 — Tests

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 250 | [LaduxApplicationTests.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/LaduxApplicationTests.java) | `…test/…/LaduxApplicationTests.java` | Context load test |
| 251 | [AbstractIntegrationTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/AbstractIntegrationTest.java) | `…test/…/AbstractIntegrationTest.java` | Base class integration test |
| 252 | [BrandControllerTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/controller/BrandControllerTest.java) | `…test/…/controller/BrandControllerTest.java` | Test API brand |
| 253 | [LoginRateLimitTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/controller/LoginRateLimitTest.java) | `…test/…/controller/LoginRateLimitTest.java` | Test rate limit login |
| 254 | [CouponTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/model/CouponTest.java) | `…test/…/model/CouponTest.java` | Unit test Coupon model |
| 255 | [RefreshTokenTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/model/RefreshTokenTest.java) | `…test/…/model/RefreshTokenTest.java` | Unit test RefreshToken |
| 256 | [ProductRepositoryTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/repository/ProductRepositoryTest.java) | `…test/…/repository/ProductRepositoryTest.java` | Test query sản phẩm |
| 257 | [SeedDataPersistenceTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/repository/SeedDataPersistenceTest.java) | `…test/…/repository/SeedDataPersistenceTest.java` | Test seed data |
| 258 | [OrderServiceTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/service/OrderServiceTest.java) | `…test/…/service/OrderServiceTest.java` | Test logic đơn hàng |
| 259 | [PricingServiceImplTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/service/PricingServiceImplTest.java) | `…test/…/service/PricingServiceImplTest.java` | Test tính giá |
| 260 | [FileStorageServiceImplTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/service/FileStorageServiceImplTest.java) | `…test/…/service/FileStorageServiceImplTest.java` | Test upload file |
| 261 | [StockMovementFlowTest.java](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/src/test/java/org/akira/ladux/service/StockMovementFlowTest.java) | `…test/…/service/StockMovementFlowTest.java` | Test luồng kho |

---

## 📄 Nhóm 13 — DevOps & Scripts

| # | Tên file | Đường dẫn | Ghi chú ngắn |
|---|----------|-----------|--------------|
| 262 | [.gitignore](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/.gitignore) | `backend/.gitignore` | Git ignore rules |
| 263 | [test-admin.ps1](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/backend/test-admin.ps1) | `backend/test-admin.ps1` | Script test API admin (PowerShell) |
| 264 | [README.md](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/README.md) | `README.md` | Tổng quan dự án |

---

> [!TIP]
> **Tổng cộng: 264 file** — Thứ tự đọc tối ưu: Config → Enums → Model → Repository → Service interface → Service impl → DTO → Controller → Exception → Migration → Test
