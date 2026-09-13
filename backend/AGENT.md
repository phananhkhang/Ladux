# BACKEND LADUX — BỘ QUY TẮC DÀNH CHO CODING AGENT

> Phạm vi áp dụng: `backend/`  
> Kiến trúc mục tiêu: **Modular Monolith theo năng lực nghiệp vụ + áp dụng có chọn lọc Kiến trúc Clean/Hexagonal**  
> Trạng thái: Các quy tắc phát triển bắt buộc  
> Cập nhật lần cuối: 2026-09-13

Tệp này là tài liệu hướng dẫn chính dành cho các coding agent làm việc trên backend của Ladux.

Trước khi thay đổi mã nguồn backend, hãy đọc kỹ tệp này cùng các tài liệu kiến trúc liên quan:

```text
docs/architecture/README.md
docs/architecture/01-target-architecture.md
docs/architecture/02-module-boundaries.md
docs/architecture/03-dependency-rules.md
docs/architecture/04-migration-plan.md
docs/architecture/05-archunit-rules.md
docs/architecture/06-examples-refactor.md
docs/architecture/07-adr/ADR-001-modular-monolith.md
```

Nếu nhiệm vụ được giao xung đột với các quy tắc này, không được âm thầm bỏ qua kiến trúc.  
Hãy nêu rõ điểm xung đột và ưu tiên lựa chọn thay đổi an toàn, nhỏ nhất có thể.

---

# 1. Quyết định kiến trúc dự án

Backend Ladux đang di chuyển từ kiến trúc monolith phân tầng kỹ thuật:

```text
controller/
dto/
model/
repository/
service/
service/impl/
```

hướng tới kiến trúc **Modular Monolith** định hướng theo nghiệp vụ:

```text
org.akira.ladux
├── identity/
├── catalog/
├── ordering/
├── payment/
├── inventory/
├── procurement/
├── promotion/
├── notification/
└── shared/
```

Backend vẫn tiếp tục là:

```text
một ứng dụng Spring Boot duy nhất
một đơn vị triển khai duy nhất (deployable unit)
dùng chung một PostgreSQL
dùng chung một Redis
```

**Tuyệt đối không** tách backend thành microservices trừ khi có một quyết định kiến trúc rõ ràng thay thế cho quy tắc này.

---

# 2. Thứ tự ưu tiên kiến trúc chính

Khi phải đánh đổi giữa các yếu tố, hãy áp dụng thứ tự ưu tiên sau:

```text
1. Bảo toàn hành vi nghiệp vụ (business behavior)
2. Bảo toàn tính nhất quán giao dịch (transaction consistency)
3. Bảo toàn các bất biến về khóa/tính lũy kế/bảo mật (locking/idempotency/security)
4. Bảo toàn khả năng tương thích của API công khai (public API compatibility)
5. Tôn trọng quyền sở hữu của module (module ownership)
6. Tôn trọng chiều phụ thuộc giữa các module (dependency direction)
7. Nâng cao tính cô lập framework (framework isolation)
8. Cải thiện tính thẩm mỹ của cấu trúc package
```

Không bao giờ hy sinh tính đúng đắn chỉ để làm cho cây thư mục package trông gọn mắt hơn.

---

# 3. Các module nghiệp vụ bắt buộc

## Identity

Sở hữu các vấn đề về tài khoản / bảo mật / danh tính khách hàng, bao gồm các khái niệm:

```text
User
Role
Customer
UserAddress
RefreshToken
EmailVerification
PhoneVerification
UserMfaMethod
LoginHistory
SecurityEvent
authentication
JWT
OAuth2
MFA
OTP
các luồng mật khẩu/bảo mật
```

## Catalog

Sở hữu các khái niệm về danh mục sản phẩm:

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

## Ordering

Sở hữu vòng đời của giỏ hàng và đơn đặt hàng bán lẻ:

```text
Cart
CartItem
Order
OrderItem
OrderHistory
ShippingAddress
OrderStatus
checkout
cancel
return
máy trạng thái đơn hàng (order state machine)
```

## Payment

Sở hữu vòng đời thanh toán và tích hợp cổng thanh toán:

```text
Payment
PaymentStatus
PaymentProvider
lần thử thanh toán (payment attempt)
webhook thanh toán
điều phối hoàn tiền (refund orchestration)
tích hợp VNPay
```

## Inventory

Sở hữu ngữ nghĩa biến động tồn kho:

```text
StockMovement
StockMovementType
StockReferenceType
reserve (giữ hàng)
release (giải phóng)
receive (nhập hàng)
adjust (điều chỉnh)
availability (khả năng cung ứng)
stock ledger (sổ cái tồn kho)
```

## Procurement

Sở hữu nghiệp vụ thu mua đầu vào:

```text
Supplier
ProductSupplier
PurchaseOrder
PurchaseOrderItem
PurchaseOrderStatus
receiving (tiếp nhận hàng)
```

## Promotion

Sở hữu các quy tắc giảm giá / mã giảm giá (coupon):

```text
Coupon
DiscountType
redemption (áp dụng mã)
rollback (hoàn trả mã)
usage limits (giới hạn sử dụng)
expiry (hạn dùng)
```

## Notification

Sở hữu các thông báo nghiệp vụ chung:

```text
Notification
NotificationType
thông báo sự kiện nghiệp vụ
thông báo liên hệ / hỗ trợ
```

## Shared

Chỉ được chứa các thành phần nguyên thủy dùng chung thực sự (cross-cutting primitives):

```text
error/
pagination/
time/
các tiện ích kỹ thuật chung/
```

`shared` tuyệt đối không được biến thành "bãi rác" chứa logic nghiệp vụ.

---

# 4. Cấu trúc module mục tiêu

Một module hoàn chỉnh có thể sử dụng cấu trúc:

```text
<module>/
├── api/
├── application/
│   ├── command/
│   ├── query/
│   └── port/
│       ├── in/
│       └── out/
├── domain/
└── infrastructure/
    ├── web/
    ├── persistence/
    └── integration/
```

Không phải module nào cũng cần mọi package trên.

Không tạo các interface, adapter, mapper, hay DTO rỗng chỉ để bắt chước sơ đồ Clean Architecture.

---

# 5. Ý nghĩa của từng tầng

## `api/`

Contract Java công khai cung cấp cho các module Ladux khác sử dụng.

Có thể chứa:

```text
các interface công khai của module
các command bất biến (immutable commands)
các kết quả bất biến (immutable results)
các view bất biến (immutable views)
các sự kiện công khai của module (public module events)
các value object / ID ổn định khi có lý do chính đáng
```

Không được để lộ:

```text
JPA entity
Spring Data repository
REST controller
các lớp SDK của nhà cung cấp
chi tiết triển khai hạ tầng
```

Ví dụ:

```java
public interface InventoryOperations {

    StockReservation reserveForOrder(
            ReserveStockCommand command
    );

    void releaseForOrder(
            ReleaseStockCommand command
    );
}
```

---

## `application/`

Nơi nắm giữ các use case và sự điều phối luồng nghiệp vụ.

Trách nhiệm thông thường:

```text
ranh giới giao dịch (transaction boundary)
điều phối quy trình nghiệp vụ (workflow orchestration)
gọi hành vi của domain
gọi API của các module khác
gọi các output port
kiểm tra phân quyền/nghiệp vụ cấp use case
```

Ví dụ:

```java
@Service
@RequiredArgsConstructor
class CancelOrderUseCase {

    private final InventoryOperations inventory;
    private final PromotionOperations promotion;
    private final OrderStore orders;

    @Transactional
    public void execute(Integer orderId, String reason) {
        // điều phối nghiệp vụ
    }
}
```

---

## `domain/`

Chứa mô hình nghiệp vụ (business model) và chính sách nghiệp vụ khi hữu ích.

Không bắt buộc tách biệt persistence một cách cứng nhắc ở mọi nơi trong giai đoạn di chuyển.

Việc một số module đã di chuyển tạm thời giữ các annotation JPA trên domain/persistence model là hoàn toàn được chấp nhận nếu việc gỡ bỏ chúng gây rủi ro lớn mà mang lại ít giá trị tức thời.

Kiến trúc Clean nghiêm ngặt được áp dụng có chọn lọc, không bắt buộc ở mọi nơi.

---

## `infrastructure/`

Chứa các chi tiết kỹ thuật / framework:

```text
REST
JPA / Spring Data
Redis
VNPay
email
SMS
CAPTCHA
nhà cung cấp OAuth
lưu trữ tệp
các HTTP client bên ngoài
các adapter cho bộ lập lịch (scheduler adapters)
```

---

# 6. Quy tắc phụ thuộc

Bên trong một module, chiều phụ thuộc mục tiêu là:

```text
infrastructure
      |
      v
application
      |
      v
domain
```

Application có thể phụ thuộc vào các abstraction/port.

Infrastructure triển khai các abstraction đó.

Giữa các module:

```text
module A -> module B.api
```

Ví dụ được phép:

```java
import org.akira.ladux.inventory.api.InventoryOperations;
```

Ví dụ bị cấm:

```java
import org.akira.ladux.inventory.infrastructure.persistence.StockMovementRepository;
```

```java
import org.akira.ladux.inventory.domain.StockMovement;
```

khi gọi từ module khác.

---

# 7. Các phụ thuộc bị cấm

Những phụ thuộc sau đây bị nghiêm cấm trong kiến trúc mục tiêu:

```text
module A -X-> module B.repository
module A -X-> module B.infrastructure
module A -X-> JPA entity nội bộ của module B

controller -X-> repository

domain -X-> infrastructure
domain -X-> web/controller

application -X-> triển khai cụ thể của infrastructure adapter

shared -X-> module nghiệp vụ
```

Không được lách luật bằng cách chuyển một lớp nghiệp vụ vào `shared`.

---

# 8. Quy tắc viết code mới

Không bổ sung tính năng nghiệp vụ mới vào các package legacy toàn cục:

```text
controller/
service/
service/impl/
repository/
model/
```

trừ khi tác vụ hiện tại là một cầu nối di chuyển (migration bridge) rõ ràng.

Mã nghiệp vụ mới thông thường phải được tạo bên trong module sở hữu tương ứng.

Các cầu nối legacy tạm thời bắt buộc phải ghi rõ:

```text
lý do (reason)
bên sở hữu (owner)
điều kiện gỡ bỏ (removal condition)
giai đoạn di chuyển mục tiêu (target migration phase)
```

---

# 9. Quy tắc Controller

REST controller đóng vai trò là các inbound adapter.

Controller được phép:

```text
parse request
validate HTTP input
xác định actor đã xác thực
gọi use case tầng application
ánh xạ kết quả sang HTTP response
```

Controller tuyệt đối không được:

```text
truy vấn repository trực tiếp
thay đổi trạng thái JPA entity trực tiếp
cài đặt quy tắc nghiệp vụ phức tạp
tự điều phối nhiều repository
nắm giữ các business transaction cốt lõi
truy cập persistence của module khác
```

Không tốt:

```java
@RestController
class AdminRoleController {

    private final RoleRepository roleRepository;
}
```

Mục tiêu:

```java
@RestController
class AdminRoleController {

    private final RoleQueryUseCase roleQueryUseCase;
}
```

---

# 10. Quy tắc dữ liệu chéo module

Tuyệt đối không để lộ JPA entity làm contract công khai của module.

Không tốt:

```java
public interface InventoryApi {

    ProductVariant reserve(
            ProductVariant variant,
            int quantity
    );
}
```

Khuyến nghị:

```java
public interface InventoryApi {

    StockReservation reserve(
            ReserveStockCommand command
    );
}
```

kết hợp contract bất biến:

```java
public record ReserveStockCommand(
        Integer variantId,
        int quantity,
        String referenceType,
        Integer referenceId
) {}
```

Ưu tiên sử dụng:

```text
ID
record
command
kết quả query
view bất biến (immutable view)
```

thay vì truyền đồ thị đối tượng entity.

---

# 11. Quy tắc Transaction

Ladux chứa nhiều luồng nghiệp vụ nhạy cảm về tính nhất quán.

Không được thay đổi ngữ nghĩa transaction trong quá trình di chuyển kiến trúc trừ khi có yêu cầu rõ ràng.

Các ví dụ sống còn bao gồm:

```text
checkout
khóa giỏ hàng (cart locking)
thay đổi tồn kho (stock mutation)
sổ cái tồn kho (stock ledger)
áp dụng coupon (coupon redemption)
hoàn trả coupon (coupon rollback)
chuyển trạng thái đơn hàng
hủy đơn hàng
tiếp nhận hàng thu mua (purchase receiving)
xử lý thanh toán thành công
webhook thanh toán
hết hạn thanh toán
luồng hoàn tiền
```

Một Modular Monolith có thể chủ động sử dụng chung một database transaction xuyên suốt các API của module.

Ví dụ:

```text
@Transactional Ordering.cancel(...)
    |
    +--> Inventory.release(...)
    +--> Promotion.rollback(...)
    +--> Order -> CANCELLED
```

Điều này hoàn toàn hợp lệ.

Không chuyển đổi luồng xử lý này sang sự kiện bất đồng bộ chỉ để giảm coupling.

---

# 12. Các cấu hình propagation và locking hiện có là bất biến

Nếu mã nguồn hiện tại đang sử dụng:

```text
@Transactional
Propagation.MANDATORY
PESSIMISTIC_WRITE
SELECT ... FOR UPDATE
cập nhật atomic bằng SQL
ràng buộc unique
khóa idempotency / mã tham chiếu duy nhất
```

hãy giả định rằng nó tồn tại có lý do cho đến khi được chứng minh điều ngược lại.

Trước khi di dời những đoạn mã như vậy:

1. Xác định rõ bất biến;
2. Xác định quyền sở hữu transaction của bên gọi;
3. Bảo toàn thuộc tính propagation;
4. Bảo toàn phạm vi khóa (lock scope);
5. Bảo toàn hành vi khi lỗi/rollback;
6. Thêm/duy trì các bài test tương ứng.

Không âm thầm thay thế cơ chế locking bằng lệnh `findById` thông thường.

---

# 13. Các bất biến của Ordering

Quá trình di chuyển phải bảo toàn các hành vi hiện tại của module Ordering như:

```text
kiểm tra tính hợp lệ của người dùng/tài khoản
quyền sở hữu giỏ hàng
khóa giỏ hàng
snapshot giá bán tại thời điểm mua
trừ / giữ tồn kho
áp dụng coupon
tạo đơn hàng
tạo các mục đơn hàng (order items)
lưu lịch sử đơn hàng
khởi tạo lần thử thanh toán
ghi sổ cái tồn kho
dọn dẹp giỏ hàng
bảo vệ chống lỗ hổng IDOR
chuyển đổi trạng thái máy trạng thái
```

Không thiết kế lại luồng checkout trong khi đang thực hiện một task thuần túy về di chuyển package.

---

# 14. Quyền sở hữu tồn kho (Inventory ownership)

Inventory là **chủ sở hữu logic của toàn bộ biến động tồn kho**.

Các module khác cuối cùng bắt buộc phải sử dụng Inventory API:

```text
Ordering    -> Inventory.api
Procurement -> Inventory.api
```

Các module khác không được phép sửa đổi trực tiếp số lượng tồn kho.

Schema vật lý hiện tại có thể vẫn tạm thời chứa:

```text
ProductVariant.stockQuantity
```

trong suốt quá trình di chuyển.

Không tạo bảng inventory mới chỉ vì mục đích thẩm mỹ kiến trúc.

Mục tiêu đầu tiên:

```text
mọi thao tác ghi tồn kho -> Inventory API
```

---

# 15. Quy tắc sổ cái tồn kho (Stock ledger)

Mọi bất biến hiện có quy định việc thay đổi tồn kho phải đi đôi với việc ghi nhận vào sổ cái tồn kho đều phải được giữ nguyên vẹn.

Không tạo ra bất kỳ luồng nào làm thay đổi tồn kho mà không ghi lại bản ghi biến động tương ứng.

Không để module khác ghi trực tiếp vào bảng persistence của `StockMovement`.

Hãy cung cấp các thao tác công khai từ inventory.

---

# 16. Quy tắc máy trạng thái đơn hàng (Order state machine)

Các bước chuyển trạng thái đơn hàng phải luôn rõ ràng và được kiểm tra tính hợp lệ.

Tuyệt đối không cho phép gọi tùy tiện:

```java
order.setStatus(...)
```

từ các service/controller không liên quan.

Bảo toàn các bước chuyển hợp lệ và các trạng thái kết thúc (terminal states).

Việc thay đổi trạng thái phải tiếp tục thông qua các hành vi application/domain do chính Ordering làm chủ.

---

# 17. Quy tắc Promotion/coupon

Ordering cuối cùng phải phụ thuộc vào API công khai của Promotion như:

```text
quote(...)
redeem(...)
rollback(...)
```

Ordering không được phụ thuộc trực tiếp vào:

```text
CouponRepository
chi tiết nội bộ JPA của Coupon
```

Nếu việc hoàn trả coupon phải đảm bảo tính nguyên tử cùng với việc hủy đơn hàng, hãy giữ nguyên hành vi transaction đồng bộ.

---

# 18. Quy tắc Payment

Payment phải làm chủ:

```text
vòng đời lần thử thanh toán
mã tham chiếu giao dịch phía merchant
request gửi sang cổng thanh toán
xác thực webhook
tính lũy kế (idempotency)
trạng thái thanh toán
điều phối hoàn tiền
```

Payment nên phụ thuộc vào:

```text
Ordering.api
```

thay vì phụ thuộc trực tiếp vào:

```text
OrderRepository
chi tiết persistence nội bộ của Ordering
```

---

# 19. VNPay phải trở thành một adapter

Cấu trúc ưu tiên:

```text
payment/application
        |
        v
PaymentGatewayPort
        |
        v
payment/infrastructure/integration/vnpay
```

Mã nguồn trong application không được chứa các chi tiết query parameter / tạo chữ ký số đặc thù của VNPay sau khi đường cắt (seam) đã được di chuyển.

Các khái niệm gợi ý:

```text
PaymentGatewayPort
VNPayAdapter
VNPayProperties
VNPaySigner
```

Không phá vỡ hành vi hiện tại của VNPay trong quá trình tái cấu trúc:

Bảo toàn:

```text
xác thực chữ ký số
khớp số tiền thanh toán
tính duy nhất của mã tham chiếu giao dịch
tính idempotency của webhook
hành vi thử lại thanh toán
tương tác trạng thái giữa đơn hàng và thanh toán
hành vi hoàn tiền
```

---

# 20. Quy tắc Identity/bảo mật

Không thiết kế lại hệ thống xác thực/bảo mật trong khi chỉ đang thực hiện di dời package.

Bảo toàn:

```text
ngữ nghĩa JWT
xoay vòng refresh token (rotation)
thu hồi refresh token (revocation)
token version
thử thách MFA
xác thực OTP
xác minh email
xác minh số điện thoại
OAuth2
giới hạn tần suất (rate limiting)
xác thực / đổi mật khẩu
sự kiện bảo mật (security events)
lịch sử đăng nhập (login history)
```

Các output port tiềm năng:

```text
EmailSenderPort
PhoneOtpPort
CaptchaPort
OAuthProviderPort
```

Việc phân phối OTP phục vụ riêng cho bảo mật có thể tiếp tục nằm trong quyền quản lý của Identity.

---

# 21. Quy tắc Procurement

Procurement sở hữu:

```text
Supplier
ProductSupplier
PurchaseOrder
PurchaseOrderItem
PurchaseOrderStatus
```

Procurement nên sử dụng:

```text
Catalog.api
Inventory.api
```

thay vì:

```text
ProductVariantRepository
persistence ngoại lai của Catalog
thay đổi tồn kho trực tiếp
```

Việc nhập kho hàng mua phải bảo toàn tính nhất quán transaction.

---

# 22. Quy tắc Notification/event

Sử dụng API module đồng bộ cho các yêu cầu nhất quán sống còn:

```text
giữ / giải phóng tồn kho
áp dụng / hoàn trả coupon
chuyển đổi trạng thái đơn hàng cốt lõi
tiếp nhận hàng thu mua
```

Sử dụng event cho các tác vụ phụ (side effects):

```text
gửi thông báo
phân tích dữ liệu (analytics)
đánh chỉ mục tìm kiếm
các tác vụ tích điểm không quan trọng
```

Không lạm dụng event chỉ vì tư tưởng "event giúp giảm bớt coupling".

Quy tắc ra quyết định:

```text
bắt buộc phải rollback transaction nghiệp vụ hiện tại khi lỗi?
        |
        có
        |
        v
API đồng bộ

có thể thực hiện an toàn sau khi đã commit?
        |
        có
        |
        v
event
```

---

# 23. Quy tắc Domain event

Event phải đại diện cho các sự kiện thực tế đã xảy ra trong quá khứ.

Ưu tiên:

```text
OrderDeliveredEvent
OrderCancelledEvent
PaymentSucceededEvent
```

Tránh các event có tính chất mệnh lệnh (command-like events) khi một use case / API đồng bộ sẽ rõ ràng hơn.

Đối với các tác vụ phụ chỉ được phép xảy ra sau khi transaction commit thành công, ưu tiên xử lý sau khi commit (after-commit handling).

---

# 24. Quy tắc Transactional Outbox

Không đưa Transactional Outbox vào quá sớm.

Chỉ xem xét áp dụng khi các event cần phải:

```text
lưu trữ bền vững (durable)
có thể thử lại (retryable)
giao tiếp xuyên tiến trình
đảm bảo chuyển phát tin cậy (guaranteed delivery)
```

Outbox là bước nâng cao độ tin cậy ở giai đoạn sau, không phải là điều kiện tiên quyết cho việc di chuyển Modular Monolith.

---

# 25. Quy tắc Flyway

Lịch sử migration hiện có của Flyway là bất biến.

Tuyệt đối không bao giờ:

```text
chỉnh sửa file V*.sql đã được áp dụng
đổi tên migration đã được áp dụng
xóa migration hiện có
thay đổi thứ tự lịch sử migration
tái sử dụng phiên bản version đã tồn tại
```

Nếu schema bắt buộc phải thay đổi:

1. Tạo một migration mới;
2. Bảo toàn tính tương thích ngược khi có thể;
3. Chạy test quá trình khởi động / migration;
4. Ghi rõ rủi ro dữ liệu;
5. Áp dụng forward-fix thay vì sửa lại lịch sử cũ.

Tái cấu trúc package không được phép tạo thêm DB migration trừ khi schema thực sự cần thay đổi.

---

# 26. Quy tắc tương thích API

Trừ khi tác vụ được giao có yêu cầu thay đổi contract API rõ ràng, hãy luôn bảo toàn:

```text
đường dẫn endpoint
phương thức HTTP
mã trạng thái (status code)
cấu trúc JSON request
cấu trúc JSON response
các quy tắc validation
yêu cầu xác thực
quy tắc phân quyền
ngữ nghĩa phân trang
hành vi trả lỗi
```

Di chuyển kiến trúc không được phép vô tình làm hỏng việc tích hợp với frontend.

---

# 27. REST DTO so với DTO của Module API

Không dùng REST DTO làm Java API công khai kết nối giữa các module.

Đây là hai mối quan tâm hoàn toàn khác nhau.

Ví dụ:

```text
catalog/api/ProductView.java

catalog/infrastructure/web/dto/ProductResponse.java
```

Các module nghiệp vụ khác nên phụ thuộc vào:

```text
ProductView
```

chứ không phải:

```text
ProductResponse
```

---

# 28. Quy tắc ánh xạ (Mapping rule)

Tránh các hàm ánh xạ static khiến cho web DTO của module này phụ thuộc trực tiếp vào JPA entity của module khác.

Mẫu thiết kế xấu về lâu dài:

```java
ProductResponse.fromEntity(product);
```

khi được sử dụng từ một module khác.

Trong quá trình di chuyển, các mapping cũ có thể tạm thời được giữ lại nếu việc sửa chúng có nguy cơ phá vỡ hành vi API, nhưng tuyệt đối không được thêm mới coupling chéo module.

---

# 29. Quy tắc Cache

Khi di chuyển đoạn mã có gắn:

```text
@Cacheable
@CacheEvict
@Caching
cache lưu trên Redis
```

hãy bảo toàn:

```text
tên cache
định dạng cache key
hành vi xóa cache (eviction)
thời điểm kích hoạt
ranh giới phân quyền
```

Việc di chuyển package không được phép vô tình thay đổi hành vi cache quan sát được từ bên ngoài.

Rà soát xem cache thuộc về:

```text
mối quan tâm application
mối quan tâm query
mối quan tâm infrastructure
```

trước khi di chuyển.

---

# 30. Quy tắc Scheduler và ShedLock

Khi di dời các tác vụ theo lịch:

```text
@Scheduled
@SchedulerLock
```

hãy bảo toàn:

```text
hành vi cron / fixed-delay
tên lock
lockAtMostFor
lockAtLeastFor
ngữ nghĩa transaction
tính lũy kế (idempotency)
```

Không tùy tiện đổi tên ShedLock khi nhiều instance của ứng dụng có thể đang cùng phụ thuộc vào nó.

Code scheduler nên nằm cùng năng lực nghiệp vụ mà nó tác động, hoặc nằm trong package infrastructure/scheduling của module đó.

---

# 31. Quy tắc Redis

Redis đóng vai trò hạ tầng kỹ thuật, không phải chính sách nghiệp vụ.

Các thành phần điển hình sử dụng Redis:

```text
cache
giới hạn tần suất (rate limit)
trạng thái thử thách / session
hỗ trợ khóa phân tán (distributed lock)
trạng thái bảo mật tạm thời
```

Ưu tiên sử dụng abstraction/port khi use case không cần biết các API cụ thể của Redis.

Không đưa trực tiếp các phụ thuộc Redis vào trong đối tượng domain.

---

# 32. Quy tắc tích hợp bên ngoài

Các nhà cung cấp bên ngoài thông thường phải được đưa về dạng adapter.

Ví dụ:

```text
VNPay
nhà cung cấp email
nhà cung cấp SMS
CAPTCHA
nhà cung cấp OAuth
lưu trữ tệp / object storage
vector store
dịch vụ AI bên ngoài
```

Mã nguồn application/domain không được để các model SDK của bên thứ ba rò rỉ vào khi có thể sử dụng một contract nội bộ ổn định.

---

# 33. Áp dụng Clean/Hexagonal Architecture có chọn lọc

Các mục tiêu có giá trị cao:

```text
Payment -> VNPay
Identity -> email/SMS/CAPTCHA/OAuth
Ordering -> Inventory
Procurement -> Inventory
các ranh giới bảo mật / nhà cung cấp phức tạp
các cổng tích hợp lưu trữ / bên thứ ba
```

Không nhân bản mọi persistence model thành:

```text
DomainEntity
JpaEntity
DomainMapper
JpaMapper
RepositoryPort
RepositoryAdapter
```

trừ khi việc phân tách đó mang lại giá trị thiết thực cụ thể.

Mục tiêu kiến trúc là giảm bớt sự phụ thuộc lẫn nhau, không phải tạo ra số lượng class nhiều nhất có thể.

---

# 34. Quy tắc cho package Shared

Được phép đặt trong `shared`:

```text
các kiểu lỗi chung
các kiểu phân trang chung
abstraction về đồng hồ/thời gian
các tiện ích kỹ thuật chung
```

Bị cấm trong `shared`:

```text
chính sách nghiệp vụ của Order
quy tắc sản phẩm
Payment
Coupon
logic nghiệp vụ của User
repository
service đặc thù theo miền
```

Nếu một class thuộc về một khái niệm nghiệp vụ rõ ràng, hãy giữ nó trong chính module nghiệp vụ đó.

---

# 35. Quy tắc kiểm thử

Di chuyển mã nguồn mà không có sự bảo vệ về mặt hành vi là không được chấp nhận.

Trước một đợt tái cấu trúc cấu trúc lớn:

1. Xác định các bài test hiện có;
2. Viết thêm characterization test khi hành vi chưa được bao phủ đầy đủ;
3. Chạy baseline test;
4. Tiến hành tái cấu trúc;
5. Chạy các bài test nhắm mục tiêu;
6. Chạy các bài test kiến trúc;
7. Chạy kiểm chứng toàn diện.

Các khu vực kiểm thử quan trọng:

```text
checkout
biến động tồn kho
vòng đời đơn hàng
webhook thanh toán
tạo URL và chữ ký VNPay
auth
MFA
OTP
refresh token
rate limiting
khởi động Flyway / kiểm thử tích hợp
nhập kho thu mua
coupon
```

---

# 36. Quy tắc Testcontainers

Các bài kiểm thử tích hợp có thể phụ thuộc vào PostgreSQL/Redis chạy qua Testcontainers.

Không đánh dấu kết quả là "code đúng" chỉ vì Docker không khả dụng.

Báo cáo tách biệt:

```text
lỗi do code / test
lỗi môi trường / container runtime
```

Khi không thể chạy đầy đủ kiểm thử tích hợp, phải nêu rõ phần nào đã được kiểm chứng và phần nào chưa thể kiểm chứng.

---

# 37. Quy tắc ArchUnit

Kiến trúc được thực thi thông qua các bài test.

Tệp mục tiêu chính:

```text
src/test/java/org/akira/ladux/architecture/ModularArchitectureTest.java
```

Thực thi theo từng bước tăng dần.

Sau khi một module hoàn thành di chuyển:

```text
các module ngoài chỉ được phép phụ thuộc vào <module>.api
các module ngoài KHÔNG ĐƯỢC PHÉP phụ thuộc vào:
<module>.application
<module>.domain
<module>.infrastructure
```

Không hạ thấp tiêu chuẩn kiểm tra của ArchUnit chỉ để CI chuyển sang màu xanh.

Nếu bắt buộc phải có ngoại lệ tạm thời, phải ghi lại:

```text
lý do (reason)
người chịu trách nhiệm (owner)
điều kiện gỡ bỏ (removal condition)
cột mốc di chuyển (migration milestone)
```

---

# 38. Không có phụ thuộc vòng

Kiến trúc mục tiêu không được chứa các chu trình phụ thuộc vòng như:

```text
Ordering -> Payment -> Ordering
```

Ưu tiên mối quan hệ một chiều.

Ví dụ:

```text
Payment -> Ordering.api
```

trong khi vòng đời thanh toán có thể được kích hoạt độc lập với checkout.

Nếu phát hiện dấu hiệu bắt buộc phải có chu trình phụ thuộc vòng, hãy dừng lại và thiết kế lại ranh giới công khai trước khi thêm phụ thuộc.

---

# 39. Chiến lược di chuyển

Sử dụng chiến lược di chuyển tăng dần.

Thứ tự ưu tiên:

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

Không di chuyển toàn bộ backend trong một nhiệm vụ duy nhất.

---

# 40. Mỗi task di chuyển chỉ tập trung một Bounded Context

Trừ khi có yêu cầu rõ ràng khác:

```text
một task di chuyển
=
một bounded context
```

Chỉ cho phép sửa đổi chéo module khi cần thiết để:

```text
tạo ranh giới công khai (public seam)
điều hướng bên tiêu thụ
loại bỏ phụ thuộc ngoại lai
giữ cho build luôn pass
```

Không tự ý tiện tay tái cấu trúc các module không liên quan.

---

# 41. Mẫu quy trình di chuyển bắt buộc

Khi di chuyển một module, thực hiện theo các bước:

```text
1. Phân tích mã nguồn hiện tại
2. Xác định module chủ quản
3. Lập danh mục phụ thuộc chiều vào (inbound)
4. Lập danh mục phụ thuộc chiều ra (outbound)
5. Xác định transaction / lock / cache / event
6. Xác định các REST contract
7. Xác định các bài test
8. Tạo API công khai cho module
9. Điều hướng các bên ngoài sang API mới
10. Di chuyển code nội bộ vào module
11. Bổ sung các rule ArchUnit
12. Chạy kiểm chứng
13. Gỡ bỏ bridge tạm thời khi đã an toàn
14. Cập nhật tài liệu
```

Luồng khuyến nghị:

```text
truy cập repository ngoại lai
        |
        v
tạo API cho module
        |
        v
điều hướng bên gọi
        |
        v
di chuyển code nội bộ
        |
        v
thực thi ranh giới
```

---

# 42. Tuyệt đối không viết lại toàn bộ theo kiểu Big-Bang

Phong cách di chuyển bị nghiêm cấm:

```text
di chuyển hàng trăm file cùng lúc
+
viết lại logic nghiệp vụ
+
thay đổi schema cơ sở dữ liệu
+
thay đổi REST API
+
thay đổi luồng thanh toán
+
thay đổi luồng bảo mật
```

trong một nhiệm vụ duy nhất.

Hãy tách rời các thay đổi cơ học về kiến trúc khỏi việc thiết kế lại hành vi nghiệp vụ.

---

# 43. Trước khi sửa đổi mã nguồn

Agent bắt buộc phải khảo sát:

```text
các class bị ảnh hưởng
các bên gọi đến (callers)
các bên được gọi (callees)
các repository
các transaction
các cơ chế lock
các annotation cache
các event
các annotation scheduler
tác động tới Flyway
các endpoint REST
các quy tắc bảo mật
các bài test
```

Đối với các luồng có rủi ro cao, hãy tóm tắt hành vi hiện tại trước khi bắt đầu sửa code.

---

# 44. Trong quá trình sửa đổi

Agent bắt buộc phải:

```text
thực hiện thay đổi nhỏ nhất, an toàn nhất
mặc định bảo toàn hành vi
mặc định bảo toàn API
mặc định bảo toàn DB
bảo toàn transaction
bảo toàn lock
bảo toàn tính lũy kế (idempotency)
tránh dọn dẹp code không liên quan
tránh đưa vào các abstraction mang tính phỏng đoán
```

---

# 45. Sau khi sửa đổi

Chạy các bước kiểm chứng liên quan.

Trên Windows:

```powershell
cd backend

.\mvnw.cmd -DskipTests compile
.\mvnw.cmd -Dtest=ModularArchitectureTest test
.\mvnw.cmd test
.\mvnw.cmd verify
```

Trên Linux/macOS:

```bash
cd backend

./mvnw -DskipTests compile
./mvnw -Dtest=ModularArchitectureTest test
./mvnw test
./mvnw verify
```

Nếu một lệnh nào đó không thể thực thi, phải giải thích rõ lý do.

Tuyệt đối không bao giờ tuyên bố test đã pass nếu chưa thực sự chạy chúng.

---

# 46. Báo cáo hoàn thành

Khi kết thúc một nhiệm vụ sửa code, hãy báo cáo:

```text
1. Phạm vi đã hoàn thành
2. Danh sách file đã thay đổi
3. Ranh giới kiến trúc đã được tạo ra / thay đổi
4. Các hành vi đã chủ động bảo toàn
5. Các bài test đã thực thi
6. Kết quả test
7. Nợ kiến trúc còn lại
8. Các cầu nối (bridges) tạm thời
9. Rủi ro / hạn chế
```

Đối với các task di chuyển, bổ sung thêm:

```text
những phụ thuộc ngoại lai nào đã được loại bỏ
những API module nào đã được đưa vào
những quy tắc ArchUnit nào đã được bổ sung
```

---

# 47. Định nghĩa hoàn thành — Module đã di chuyển

Một module chưa được coi là hoàn thành di chuyển cho đến khi:

- [ ] Các class nghiệp vụ nằm gọn trong module mục tiêu;
- [ ] Quyền sở hữu được ghi lại trong tài liệu;
- [ ] API công khai chéo module được định nghĩa rõ ràng;
- [ ] Các module ngoài chỉ sử dụng `*.api`;
- [ ] Toàn bộ truy cập repository ngoại lai đã được dọn sạch;
- [ ] API công khai không để lộ JPA entity;
- [ ] Không có controller nào truy cập trực tiếp repository;
- [ ] Ngữ nghĩa transaction được bảo toàn;
- [ ] Cơ chế locking được bảo toàn;
- [ ] Tính tương thích của API được bảo toàn trừ khi chủ động thay đổi;
- [ ] Hành vi cache đã được rà soát;
- [ ] Hành vi scheduler đã được rà soát;
- [ ] Các bài kiểm thử kiến trúc đều pass;
- [ ] Các bài kiểm thử hành vi nhắm mục tiêu đều pass;
- [ ] Quá trình Maven verification chạy pass;
- [ ] Tài liệu đã được cập nhật;
- [ ] Không còn ngoại lệ tạm thời nào chưa được ghi chú tài liệu.

---

# 48. Các điều kiện phải dừng lại (Stop conditions)

Không đưa ra các giả định mang tính phá hủy khi phát hiện bất kỳ dấu hiệu nào sau đây:

```text
cần chỉnh sửa migration Flyway đã được áp dụng
không thể tránh khỏi việc phá vỡ contract của public API
ngữ nghĩa transaction không thể bảo toàn
di chuyển dữ liệu có nguy cơ gây mất mát dữ liệu
ý đồ locking / tính idempotency hiện tại chưa rõ ràng
phát hiện credential production nằm trong mã nguồn
nhiều module cốt lõi đòi hỏi phải viết lại cùng lúc
test hiện có không đủ để đảm bảo an toàn cho việc thiết kế lại hành vi rủi ro cao
```

Đối với những điểm mơ hồ không mang tính phá hủy, hãy chọn thay đổi bảo thủ, nhỏ nhất và ghi chú rõ giả định đã đưa ra.

---

# 49. Những hành vi cấm đối với Agent

Tuyệt đối không:

- Viết lại toàn bộ backend trong một nhiệm vụ duy nhất;
- Chuyển đổi Ladux thành microservices;
- Đưa Kafka/RabbitMQ vào chỉ để "giảm liên kết giữa các module";
- Thêm Kubernetes chỉ phục vụ cho việc di chuyển kiến trúc;
- Thay thế luồng nghiệp vụ đồng bộ cốt lõi bằng các sự kiện bất đồng bộ khi chưa có thiết kế rõ ràng;
- Vô tình làm thay đổi các contract REST;
- Sửa đổi các migration Flyway cũ;
- Trực tiếp thay đổi số lượng tồn kho bên ngoài Inventory;
- Trực tiếp thay đổi trạng thái đơn hàng bên ngoài các quy tắc vòng đời của Ordering;
- Bỏ qua các quy tắc về chữ ký số / tính idempotency trong thanh toán;
- Hạ thấp tiêu chuẩn bảo mật để đơn giản hóa việc di chuyển;
- Đưa logic nghiệp vụ vào `shared`;
- Thêm mới việc truy cập repository chéo module;
- Để lộ JPA entity qua ranh giới module;
- Bỏ qua hoặc làm suy yếu ArchUnit chỉ để test pass;
- Gỡ bỏ lock mà không chứng minh được rằng chúng không cần thiết;
- Âm thầm loại bỏ việc xóa cache (cache eviction);
- Âm thầm đổi tên các định danh ShedLock;
- Thêm các abstraction mà không mang lại ranh giới ý nghĩa;
- Trộn lẫn các tính năng mới không liên quan vào nhiệm vụ di chuyển kiến trúc.

---

# 50. Quy trình làm việc khuyến nghị cho Agent — Chỉ phân tích

Sử dụng prompt mẫu này trước một đợt di chuyển có rủi ro cao:

```text
Đọc backend/AGENT.md và tất cả các file docs/architecture liên quan.

Phân tích bounded context <MODULE> trong codebase hiện tại.

Chưa chỉnh sửa mã nguồn.

Báo cáo:
1. Danh sách file hiện tại;
2. Các phụ thuộc chiều vào;
3. Các phụ thuộc chiều ra;
4. Các điểm rò rỉ repository/entity ngoại lai;
5. Các contract REST;
6. Ranh giới transaction;
7. Hành vi locking;
8. Hành vi cache / event / scheduler;
9. Các bài test hiện có;
10. Đề xuất API công khai cho module;
11. Các bước di chuyển dưới dạng các commit nhỏ;
12. Các rủi ro và chiến lược rollback.
```

---

# 51. Quy trình làm việc khuyến nghị cho Agent — Di chuyển module

```text
Đọc backend/AGENT.md và docs/architecture.

Chỉ di chuyển module <MODULE> theo mục tiêu Modular Monolith đã được ghi trong tài liệu.

Ràng buộc:
- bảo toàn REST contract;
- bảo toàn hành vi nghiệp vụ;
- bảo toàn propagation của transaction;
- bảo toàn locking;
- bảo toàn tính lũy kế (idempotency);
- bảo toàn hành vi bảo mật;
- không sửa các migration Flyway cũ;
- tránh thay đổi DB schema trừ khi thực sự cần thiết;
- phụ thuộc chéo module phải thông qua *.api;
- không để lộ JPA entity;
- thêm/cập nhật các rule ArchUnit;
- chạy các test nhắm mục tiêu và toàn bộ Maven verification.

Tuân thủ thứ tự:
1. tạo ranh giới công khai;
2. điều hướng bên tiêu thụ;
3. di chuyển code nội bộ;
4. thực thi ranh giới;
5. gỡ bỏ bridge lỗi thời khi đã an toàn.

Cuối cùng báo cáo:
- các file đã thay đổi;
- các giả định;
- test đã chạy / kết quả;
- nợ kiến trúc còn lại;
- điểm rollback an toàn.
```

---

# 52. Quy trình làm việc khuyến nghị cho Agent — Review code

```text
Review bản diff hiện tại dựa trên:

backend/AGENT.md
docs/architecture/02-module-boundaries.md
docs/architecture/03-dependency-rules.md

Đặc biệt kiểm tra các vấn đề:
- truy cập repository ngoại lai;
- rò rỉ JPA entity;
- controller -> repository;
- chu trình phụ thuộc vòng;
- hồi quy transaction;
- đánh mất pessimistic lock;
- hồi quy tính idempotency;
- thay đổi contract REST ngoài ý muốn;
- sửa đổi lịch sử Flyway;
- hồi quy việc xóa cache;
- hồi quy scheduler / ShedLock;
- sử dụng event thay cho lời gọi đồng bộ cốt lõi;
- đưa code nghiệp vụ vào package shared;
- thiếu characterization test;
- thiếu độ bao phủ của ArchUnit.

Không mở rộng phạm vi tái cấu trúc vượt quá phạm vi hiện tại.
```

---

# 53. Tài liệu tham khảo kiến trúc

Các tài liệu chính của dự án:

```text
docs/architecture/01-target-architecture.md
docs/architecture/02-module-boundaries.md
docs/architecture/03-dependency-rules.md
docs/architecture/04-migration-plan.md
docs/architecture/05-archunit-rules.md
docs/architecture/06-examples-refactor.md
docs/architecture/07-adr/ADR-001-modular-monolith.md
```

Các nguyên tắc kiến trúc được áp dụng bao gồm:

```text
Modular Monolith
Tổ chức package theo năng lực nghiệp vụ / bounded context
Ports & Adapters / Hexagonal Architecture
Chiều phụ thuộc theo Clean Architecture
Di chuyển từng bước tăng dần
Thực thi kiểm soát kiến trúc thông qua ArchUnit
```

---

# 54. Quy tắc kiến trúc cốt lõi cuối cùng

Khi thêm mới hoặc chỉnh sửa mã nguồn backend, hãy luôn tự hỏi:

```text
Ai là người sở hữu năng lực nghiệp vụ này?

Module khác có thực sự cần toàn bộ class này không,
hay chỉ cần một contract công khai nhỏ gọn?

Sự phụ thuộc có thể đi qua <module>.api
thay vì chọc sâu vào nội bộ repository/entity hay không?

Mình có đang bảo toàn các bất biến nghiệp vụ hiện tại không?

ArchUnit có thể thực thi ranh giới này không?
```

Mục tiêu không phải là tạo ra càng nhiều tầng càng tốt.

Mục tiêu tối thượng là:

> **Một hệ thống Spring Boot Modular Monolith với các ranh giới nghiệp vụ tường minh, có thể thực thi tự động, dễ kiểm thử và an toàn để phát triển lâu dài.**
