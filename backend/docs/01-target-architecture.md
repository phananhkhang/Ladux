# Backend Ladux — Kiến trúc Mục tiêu

> Trạng thái: Kiến trúc mục tiêu đề xuất  
> Phạm vi: `backend/`  
> Mục tiêu: Di chuyển từng bước từ tổ chức theo tầng kỹ thuật (package-by-layer) sang Modular Monolith định hướng theo nghiệp vụ, kết hợp áp dụng có chọn lọc Kiến trúc Clean/Hexagonal.

## 1. Quyết định kiến trúc

Ladux tiếp tục là **một ứng dụng Spring Boot duy nhất và một đơn vị triển khai duy nhất (deployable unit)**.

**Tuyệt đối không** tách thành microservices trong quá trình di chuyển này.

Các module nghiệp vụ cấp cao nhất mục tiêu:

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

Thứ tự ưu tiên khi di chuyển là:

```text
Ranh giới nghiệp vụ (business boundary)
    >
An toàn giao dịch (transaction safety)
    >
API công khai của module (public module API)
    >
Độ thuần khiết về framework/persistence
```

Dự án **không** hướng đến việc áp dụng máy móc Kiến trúc Clean ở mọi nơi.

Việc áp dụng có chọn lọc Kiến trúc Clean/Hexagonal mang lại giá trị cao nhất tại:
- Ranh giới VNPay / cổng thanh toán (payment gateway);
- Tích hợp email / SMS / CAPTCHA / OAuth;
- Ranh giới Redis / hạ tầng bên ngoài;
- Ordering ↔ Inventory;
- Procurement ↔ Inventory;
- Các cổng tích hợp bảo mật / nhà cung cấp bên ngoài.

## 2. Xác nhận từ codebase hiện tại

Repository hiện tại phần lớn được tổ chức theo các tầng kỹ thuật:

```text
controller/
dto/
model/
repository/
service/
service/impl/
```

Một số package DTO đã phản ánh các lĩnh vực nghiệp vụ như `catalog`, `order`, `inventory`, `promotion`, và `user`, nhưng quyền sở hữu của service/repository/model vẫn chủ yếu ở mức toàn cục (global).

Backend hiện tại đã chứa các luồng nghiệp vụ phức tạp đòi hỏi phải được bảo toàn trong quá trình tái cấu trúc:
- Quy trình checkout nguyên tử (atomic checkout);
- Biến động tồn kho và ghi nhận sổ cái tồn kho (stock ledger);
- Vòng đời đơn hàng / máy trạng thái (order state machine);
- Logic thanh toán và webhook VNPay;
- Sử dụng và hoàn trả coupon (redemption/rollback);
- Redis;
- MFA / OTP / JWT;
- Flyway;
- Bộ lập lịch / ShedLock;
- Kiểm thử tích hợp dựa trên Testcontainers.

Đây là các quan sát thực tế từ codebase. Cấu trúc module dưới đây là kiến trúc mục tiêu được khuyến nghị.

## 3. Cấu trúc module chuẩn

Một module đầy đủ có thể sử dụng cấu trúc:

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

Không phải module nào cũng cần đầy đủ tất cả các thư mục trên.

Tránh tạo ra các abstraction rỗng chỉ nhằm mục đích sao chép hình vẽ biểu đồ Clean Architecture.

## 4. Ý nghĩa của từng tầng

### `api/`

Contract Java công khai (public contract) được phơi bày cho các module Ladux khác sử dụng.

Có thể chứa:
- Interface giao tiếp chéo module;
- Record bất biến (immutable) cho command/query/result;
- Sự kiện (event) ổn định;
- ID / value type ổn định khi có lý do chính đáng.

Tuyệt đối không chứa:
- JPA entity;
- Spring Data repository;
- REST controller;
- Lớp SDK của bên thứ ba;
- Triển khai adapter (adapter implementation).

Ví dụ:

```java
package org.akira.ladux.inventory.api;

public interface InventoryOperations {
    StockReservation reserveForOrder(ReserveStockCommand command);
    void releaseForOrder(ReleaseStockCommand command);
}
```

### `application/`

Nơi nắm giữ các use case và điều phối (orchestration).

Trách nhiệm:
- Ranh giới giao dịch (transaction boundary);
- Điều phối luồng quy trình nghiệp vụ;
- Gọi các đối tượng domain;
- Gọi các output port;
- Gọi API công khai của các module khác.

Ví dụ:

```java
@Service
@RequiredArgsConstructor
class CancelOrderUseCase {

    private final InventoryOperations inventory;
    private final PromotionOperations promotion;
    private final OrderStore orderStore;

    @Transactional
    public void cancel(Integer orderId, String reason) {
        // điều phối nghiệp vụ
    }
}
```

### `domain/`

Chứa mô hình nghiệp vụ (business model) và quy tắc/chính sách nghiệp vụ khi hữu ích.

Quá trình di chuyển **không** bắt buộc ngay lập tức mọi JPA entity phải chuyển thành domain model tách biệt hoàn toàn khỏi persistence.

Tính thuần khiết nghiêm ngặt của domain là tùy chọn và chỉ nên được đưa vào nơi mang lại giá trị rõ ràng.

### `infrastructure/`

Chứa chi tiết kỹ thuật và triển khai framework:
- REST;
- JPA / Spring Data;
- VNPay;
- Redis;
- Email;
- Lưu trữ tệp (file storage);
- HTTP client bên ngoài.

## 5. Chiều phụ thuộc cho phép

Bên trong một module:

```text
infrastructure
      |
      v
application
      |
      v
domain
```

Application có thể phụ thuộc vào abstraction / port.

Infrastructure sẽ triển khai (implement) các port đó.

Giữa các module với nhau:

```text
module A ---> module B.api
```

Nghiêm cấm:

```text
module A -X-> module B.infrastructure
module A -X-> module B.repository
module A -X-> module B internal JPA entity
controller -X-> repository
domain -X-> web/controller
shared -X-> business module
```

## 6. Bản đồ phụ thuộc mục tiêu

```text
Ordering
    ├──> Catalog.api
    ├──> Inventory.api
    └──> Promotion.api

Payment
    └──> Ordering.api

Procurement
    ├──> Catalog.api
    └──> Inventory.api

Inventory
    └──> Catalog.api  (chỉ khi cần xác thực/truy vấn)

Ordering / Payment / Procurement / Identity
    └──events──> Notification

Mọi module
    └──> Shared
```

Tuyệt đối không cho phép chu trình phụ thuộc vòng (dependency cycles).

## 7. REST là adapter, không phải API của module

Tránh nhầm lẫn giữa:

```text
<module>.api
```

với các REST endpoint.

REST thuộc về:

```text
<module>.infrastructure.web
```

Controller có nhiệm vụ:
- Xác thực/parse dữ liệu HTTP đầu vào;
- Xác định actor đã được chứng thực (authenticated actor);
- Gọi application use case;
- Ánh xạ kết quả trả về HTTP response.

Controller tuyệt đối không được trực tiếp quản lý persistence hoặc đưa ra các quyết định nghiệp vụ.

## 8. Chiến lược cơ sở dữ liệu

Trong quá trình di chuyển:
- Tiếp tục dùng chung một PostgreSQL;
- Không tách database;
- Không di dời bảng chỉ vì lý do thẩm mỹ kiến trúc;
- Giữ nguyên lịch sử Flyway đã áp dụng, không được sửa đổi.

Quyền sở hữu logic (logical ownership) quan trọng hơn vị trí vật lý của bảng trong giai đoạn di chuyển đầu tiên.

Ví dụ điểm nóng:

```text
ProductVariant.stockQuantity
```

Quyền sở hữu logic khuyến nghị:

```text
Catalog:
- Danh tính biến thể (variant identity)
- SKU
- Tùy chọn / cấu hình
- Metadata giá bán

Inventory:
- Khả năng cung ứng (availability)
- Giữ hàng (reserve)
- Giải phóng hàng (release)
- Nhập kho (receive)
- Điều chỉnh kho (adjust)
- Sổ cái tồn kho (stock ledger)
```

Cột `stock_quantity` hiện có có thể tạm thời tiếp tục nằm vật lý trong bảng hiện tại.

Bước chuyển dịch quan trọng là:

```text
mọi thao tác ghi tồn kho -> Inventory API
```

## 9. Chiến lược transaction

Một Modular Monolith có thể chủ động sử dụng chung một database transaction xuyên suốt các API của module.

Ví dụ:

```text
@Transactional
Ordering.cancelOrder(...)
    ├── Inventory.releaseForOrder(...)
    ├── Promotion.rollback(...)
    └── Order -> CANCELLED
```

Không được chuyển đổi các thao tác đồng bộ có tính sống còn về nhất quán thành sự kiện bất đồng bộ chỉ nhằm mục đích giảm coupling.

Sử dụng API module đồng bộ khi việc thất bại đòi hỏi phải rollback toàn bộ business transaction hiện tại.

Chỉ sử dụng event cho các tác vụ phụ (side effects) như:
- Thông báo (notification);
- Phân tích dữ liệu (analytics);
- Lập chỉ mục tìm kiếm (search indexing);
- Tích điểm/khách hàng thân thiết khi sự nhất quán sau cùng (eventual consistency) được chấp nhận rõ ràng.

## 10. Ưu tiên áp dụng Clean/Hexagonal

Các mục tiêu mang lại giá trị cao:

### Payment

```text
payment/application
        |
        v
PaymentGatewayPort
        |
        v
payment/infrastructure/integration/vnpay/VNPayAdapter
```

### Identity

Các port tiềm năng:
- `EmailSenderPort`
- `PhoneOtpPort`
- `CaptchaPort`
- `OAuthProviderPort`
- Adapter xử lý thử thách MFA lưu trên Redis

### Inventory

Ordering và Procurement phải sử dụng các thao tác công khai của Inventory thay vì truy cập sâu vào nội bộ persistence của inventory.

## 11. Triển khai

Kiến trúc này độc lập với môi trường lưu trữ (hosting).

Cùng một ứng dụng Modular Monolith có thể được triển khai lên:
- VPS;
- PaaS;
- Docker Compose;
- Nền tảng container (K8s/Docker Swarm).

GitHub đóng vai trò là nền tảng quản lý mã nguồn / CI/CD, chứ không phải runtime của Spring Boot.

## 12. Định nghĩa hoàn thành kiến trúc (Definition of Done)

Kiến trúc mục tiêu được coi là đã hoàn thành khi:

- [ ] Mã nguồn nghiệp vụ được sắp xếp theo từng module;
- [ ] Mỗi entity / thao tác sửa đổi dữ liệu có một chủ sở hữu logic duy nhất rõ ràng;
- [ ] Việc truy cập giữa các module bắt buộc phải thông qua `*.api`;
- [ ] Toàn bộ truy cập repository ngoại lai (foreign repository) đã được loại bỏ;
- [ ] Các REST controller không gọi trực tiếp repository;
- [ ] Các API module công khai không làm rò rỉ JPA entity;
- [ ] Ngữ nghĩa transaction được bảo toàn;
- [ ] Các contract REST hiện có vẫn tương thích trừ khi được chủ động thay đổi;
- [ ] Lịch sử Flyway được giữ nguyên không thay đổi;
- [ ] ArchUnit thực thi kiểm tra các ranh giới đã di chuyển;
- [ ] CI chạy kiểm tra cả kiến trúc và test nghiệp vụ;
- [ ] Không tồn tại chu trình phụ thuộc vòng giữa các module.
