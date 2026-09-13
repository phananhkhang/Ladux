# Backend Ladux — Kế hoạch Di chuyển (Migration Plan)

## 1. Chiến lược di chuyển

Không viết lại (rewrite) toàn bộ backend.

Sử dụng chiến lược di chuyển tăng dần:

```text
Monolith phân tầng (Layered Monolith)
    |
    v
Package theo nghiệp vụ (Business-domain packages)
    |
    v
Ranh giới module công khai (Public module boundaries)
    |
    v
Thực thi bằng ArchUnit (ArchUnit enforcement)
    |
    v
Áp dụng có chọn lọc Clean/Hexagonal
```

## 2. Nguyên tắc

1. Mỗi task/PR ưu tiên xử lý một bounded context.
2. Bảo toàn hành vi hiện tại trước khi thiết kế lại.
3. Mặc định giữ nguyên các REST contract.
4. Bảo toàn ngữ nghĩa transaction.
5. Bảo toàn cơ chế locking / idempotency.
6. Tuyệt đối không sửa các migration Flyway cũ đã áp dụng.
7. Không thay đổi DB schema chỉ vì lý do thẩm mỹ sắp xếp package.
8. Tạo module API trước khi di chuyển các thành phần sử dụng khi cần thiết.
9. Bật các quy tắc kiểm tra ArchUnit ngay sau khi module đạt ranh giới mục tiêu.
10. Giữ các commit nhỏ và có thể revert dễ dàng.

## 3. Thứ tự khuyến nghị

```text
Foundation (Nền tảng)
   |
   v
Catalog
   |
   v
Promotion
   |
   v
Inventory
   |
   v
Procurement
   |
   v
Ordering
   |
   v
Payment
   |
   v
Identity
   |
   v
Notification
   |
   v
Hardening (Gia cố)
```

### Lý do chọn thứ tự này

**Catalog đầu tiên**
- Được tham chiếu rộng rãi nhất;
- Tạo các API truy vấn sản phẩm / biến thể ổn định cho các module khác.

**Promotion tiếp theo**
- Quy mô tương đối nhỏ;
- Thích hợp để xác thực mẫu thiết kế với mức độ rủi ro thấp.

**Inventory trước Ordering / Procurement**
- Ordering và Procurement cần gọi các API của Inventory.

**Ordering sau các module phụ thuộc**
- Module có rủi ro cao, chứa nhiều transaction phức tạp.

**Payment sau API của Ordering**
- Loại bỏ sự phụ thuộc trực tiếp vào `OrderRepository`.

**Identity ở giai đoạn sau**
- Chứa nhiều logic bảo mật phức tạp; nên di chuyển khi công cụ kiến trúc đã ổn định.

**Notification gần cuối cùng**
- Chuyển đổi các tác vụ phụ không quan trọng thành event sau khi các core module đã ổn định.

## 4. Giai đoạn nền tảng (Foundation)

Các hạng mục bàn giao:

```text
AGENTS.md
docs/architecture/*
Dependency ArchUnit
ModularArchitectureTest
Workflow CI cho backend
Kết quả kiểm thử baseline ban đầu
```

Không di chuyển khối lượng lớn mã nguồn nghiệp vụ trong cùng task nền tảng này.

## 5. Di chuyển Catalog

Quyền sở hữu mục tiêu:

```text
Product
ProductVariant
ProductImage
Brand
Category
Color
Review
Wishlist
```

Ranh giới công khai gợi ý:

```text
CatalogProductQuery
CatalogVariantQuery
ProductView
VariantView
```

Các bước di chuyển:

```text
1. Rà soát danh sách file của Catalog
2. Xác định các bên ngoài đang tiêu thụ
3. Xây dựng `catalog.api`
4. Điều hướng các bên tiêu thụ sang `catalog.api`
5. Chuyển controller/service/repository/model vào catalog
6. Bảo toàn REST contract
7. Thêm các rule ArchUnit
8. Chạy kiểm thử
```

Không thiết kế lại schema `stock_quantity` tại bước này.

## 6. Di chuyển Promotion

Di chuyển:
- Coupon;
- DiscountType;
- Chính sách áp dụng mã (redemption policy).

Tạo:

```text
PromotionOperations
quote(...)
redeem(...)
rollback(...)
```

Mục tiêu:

```text
Ordering không còn phụ thuộc vào CouponRepository.
```

## 7. Di chuyển Inventory

Di chuyển/sở hữu:
- StockMovement;
- Biến động tồn kho;
- Hành vi sổ cái tồn kho (ledger).

Tạo:

```text
InventoryOperations
reserveForOrder(...)
releaseForOrder(...)
receivePurchase(...)
adjustStock(...)
getAvailability(...)
```

Sau giai đoạn này:

```text
mọi thao tác ghi tồn kho bắt buộc phải qua Inventory
```

Cột vật lý có thể tiếp tục nằm trong bảng `product_variants`.

## 8. Di chuyển Procurement

Di chuyển:
- Supplier;
- ProductSupplier;
- PurchaseOrder;
- PurchaseOrderItem.

Thay thế các phụ thuộc trực tiếp:

```text
ProductVariantRepository
    ->
CatalogVariantQuery

StockMovementService
    ->
InventoryOperations
```

Quá trình nhập kho phải bảo toàn tính nhất quán transaction.

## 9. Di chuyển Ordering

Di chuyển:
- Cart;
- CartItem;
- Order;
- OrderItem;
- OrderHistory;
- ShippingAddress;
- OrderStateMachine;
- OrderLifecycle.

Đây là giai đoạn có mức độ rủi ro cao.

Bắt buộc phải bảo toàn:
- Khóa giỏ hàng (cart locking);
- Quy trình checkout nguyên tử;
- Giữ / trừ tồn kho;
- Ghi sổ cái tồn kho;
- Áp dụng coupon;
- Hoàn trả coupon;
- Lịch sử đơn hàng;
- Quy trình hủy đơn;
- Luồng trả hàng;
- Tương tác khi thanh toán hết hạn;
- Các bất biến của máy trạng thái.

Cần có các bài test đặc tả hành vi (characterization test) trước khi thực hiện những thay đổi cấu trúc lớn.

## 10. Di chuyển Payment

Di chuyển:
- Payment;
- Vòng đời lần thử thanh toán;
- Webhook;
- Tích hợp VNPay.

Giới thiệu:

```text
OrderingPaymentApi
PaymentGatewayPort
VNPayAdapter
```

Bắt buộc phải bảo toàn:
- Xác thực chữ ký số;
- Khớp số tiền thanh toán;
- Tính duy nhất của mã tham chiếu merchant;
- Webhook đảm bảo tính idempotency;
- Hành vi thử lại (retry);
- Tương tác trạng thái đơn hàng / thanh toán.

Không gộp việc di chuyển package với việc thiết kế lại luồng thanh toán trừ khi đã được lên kế hoạch riêng.

## 11. Di chuyển Identity

Di chuyển:
- User;
- Customer;
- Role;
- RefreshToken;
- JWT;
- MFA;
- OTP;
- OAuth2;
- Sự kiện bảo mật;
- Lịch sử đăng nhập;
- Giới hạn tần suất đăng nhập (rate limiting).

Các port gợi ý:

```text
EmailSenderPort
PhoneOtpPort
CaptchaPort
OAuthProviderPort
```

Không thiết kế lại đồng thời cả auth/bảo mật lẫn cấu trúc kiến trúc mà không tách thành task riêng biệt.

## 12. Di chuyển Notification

Di chuyển:
- Notification;
- NotificationType;
- Hành vi thông báo liên hệ / hỗ trợ.

Ưu tiên tiêu thụ event cho các tác vụ phụ không mang tính cốt lõi.

Việc gửi OTP bảo mật có thể tiếp tục nằm trong Identity.

## 13. Giai đoạn gia cố (Hardening)

- Xóa bỏ các lớp bridge tạm thời;
- Xóa các package kỹ thuật toàn cục cũ;
- Cấm tạo mới `service/impl`, `repository`, `model` toàn cục;
- Bật kiểm tra chu trình phụ thuộc vòng;
- Siết chặt các quy tắc chéo module;
- Kiểm toán lại package `shared`;
- Bổ sung các rule Clean nghiêm ngặt có chọn lọc;
- Cập nhật sơ đồ kiến trúc.

## 14. Quy trình chuẩn cho một module

### Trước khi thay đổi

- [ ] Đọc `AGENTS.md`.
- [ ] Đọc các tài liệu kiến trúc liên quan.
- [ ] Rà soát danh sách file hiện tại.
- [ ] Liệt kê các phụ thuộc chiều vào (inbound).
- [ ] Liệt kê các phụ thuộc chiều ra (outbound).
- [ ] Liệt kê các điểm rò rỉ repository / entity ngoại lai.
- [ ] Liệt kê các endpoint REST.
- [ ] Liệt kê `@Transactional` và thiết lập propagation.
- [ ] Liệt kê cơ chế lock.
- [ ] Liệt kê cache.
- [ ] Liệt kê event.
- [ ] Liệt kê scheduler.
- [ ] Liệt kê test hiện có.
- [ ] Chạy baseline test.

### Tạo ranh giới (Seam)

Nếu module khác đang truy cập trực tiếp vào nội bộ:

```text
phụ thuộc ngoại lai
    |
    v
tạo API công khai cho module
    |
    v
điều hướng bên gọi sang API mới
    |
    v
di chuyển code nội bộ
    |
    v
thực thi bằng ArchUnit
```

### Kiểm chứng (Verification)

Windows:

```powershell
cd backend

.\mvnw.cmd -DskipTests compile
.\mvnw.cmd -Dtest=ModularArchitectureTest test
.\mvnw.cmd test
.\mvnw.cmd verify
```

Linux/macOS:

```bash
cd backend

./mvnw -DskipTests compile
./mvnw -Dtest=ModularArchitectureTest test
./mvnw test
./mvnw verify
```

## 15. Chiến lược Commit

Khuyến nghị:

```text
refactor(catalog): introduce catalog query API
refactor(catalog): move product classes into catalog module
test(architecture): enforce catalog module boundary
```

Tránh:

```text
refactor toàn bộ kiến trúc backend + thêm tính năng mới + đổi DB + viết lại payment
```

trong một PR duy nhất.

## 16. Chiến lược Rollback

Di chuyển chỉ liên quan đến package:

```text
git revert <commit-hoac-pr-di-chuyen-module>
```

Không yêu cầu rollback cơ sở dữ liệu.

Nếu thực sự bắt buộc phải thay đổi schema:
- Thêm migration Flyway mới;
- Thiết kế đảm bảo tương thích ngược;
- Định nghĩa kế hoạch sao lưu / phục hồi;
- Ưu tiên forward-fix thay vì sửa đổi lịch sử migration.

## 17. Định nghĩa hoàn thành cho module đã di chuyển

- [ ] Các class nằm trọn vẹn trong module mục tiêu;
- [ ] API công khai chéo module được khai báo tường minh;
- [ ] Các module bên ngoài chỉ import `*.api`;
- [ ] Không còn truy cập repository ngoại lai;
- [ ] Không để lộ JPA entity ra ngoài;
- [ ] Hành vi REST vẫn tương thích;
- [ ] Ngữ nghĩa transaction / lock vẫn tương thích;
- [ ] Các bài test nhắm mục tiêu đều pass;
- [ ] Các bài test kiến trúc đều pass;
- [ ] Lệnh Maven verify chạy thành công toàn bộ;
- [ ] Tài liệu đã được cập nhật;
- [ ] Các khoản nợ kỹ thuật tạm thời đều có điều kiện tháo gỡ rõ ràng.

## 18. Prompt cho Agent — Chỉ phân tích

```text
Đọc AGENTS.md và tất cả các file liên quan trong docs/architecture.

Phân tích bounded context <MODULE> trong codebase hiện tại.

Chưa chỉnh sửa mã nguồn.

Báo cáo lại:
1. Danh sách file hiện tại;
2. Các phụ thuộc chiều vào;
3. Các phụ thuộc chiều ra;
4. Các điểm rò rỉ repository / entity ngoại lai;
5. Các contract REST;
6. Hành vi transaction / lock / cache / event;
7. Các bài test hiện có;
8. Đề xuất API công khai cho module;
9. Các bước di chuyển dưới dạng các commit nhỏ;
10. Các rủi ro và chiến lược rollback.
```

## 19. Prompt cho Agent — Di chuyển một module

```text
Đọc AGENTS.md và docs/architecture.

Chỉ thực hiện di chuyển module <MODULE>.

Các ràng buộc:
- Bảo toàn REST contract;
- Bảo toàn hành vi nghiệp vụ;
- Bảo toàn propagation của transaction;
- Bảo toàn cơ chế lock;
- Không chỉnh sửa migration Flyway cũ;
- Không thay đổi DB schema trừ khi tuyệt đối cần thiết;
- Phụ thuộc chéo module phải thông qua *.api;
- Không để lộ JPA entity;
- Thêm / cập nhật các rule ArchUnit;
- Chạy các test nhắm mục tiêu, ModularArchitectureTest và mvnw verify.

Tuân thủ thứ tự:
1. Tạo ranh giới công khai (public seam);
2. Điều hướng các bên tiêu thụ;
3. Di chuyển code nội bộ;
4. Thực thi ranh giới;
5. Gỡ bỏ bridge tạm thời khi đã an toàn.

Báo cáo:
- Danh sách file thay đổi;
- Các giả định;
- Kết quả test đã chạy;
- Nợ kỹ thuật còn lại;
- Điểm rollback an toàn.
```
