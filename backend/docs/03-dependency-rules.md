# Backend Ladux — Quy tắc Phụ thuộc (Dependency Rules)

Các quy tắc dưới đây là ràng buộc kiến trúc bắt buộc, không phải gợi ý về văn phong.

## 1. Quy tắc phụ thuộc cốt lõi

Chiều phụ thuộc của mã nguồn phải hướng về chính sách nghiệp vụ (business policy), không hướng về công nghệ bên ngoài.

Mục tiêu thực tế:

```text
web adapter
    |
    v
application
    |
    v
domain

application --> port abstraction
infrastructure --> triển khai port
```

## 2. Các phụ thuộc được phép

Bên trong một module:

```text
infrastructure -> application
infrastructure -> domain
infrastructure -> api
application    -> domain
application    -> port abstractions
```

Giữa các module:

```text
module A -> module B.api
```

## 3. Các phụ thuộc bị cấm

```text
domain -X-> infrastructure
domain -X-> controller/web
application -X-> triển khai cụ thể của infrastructure
module A -X-> module B.infrastructure
module A -X-> module B.repository
module A -X-> module B JPA entity
shared -X-> business module
controller -X-> repository
```

## 4. Quy tắc API module công khai

Được phép:

```java
import org.akira.ladux.catalog.api.CatalogVariantQuery;
```

Bị cấm:

```java
import org.akira.ladux.catalog.infrastructure.persistence.ProductVariantJpaRepository;
```

Bị cấm:

```java
import org.akira.ladux.catalog.domain.ProductVariant;
```

khi sử dụng từ module khác.

Nếu một module khác cần dữ liệu sản phẩm / biến thể, hãy cung cấp một view bất biến (immutable view).

## 5. Quy tắc Controller

Trách nhiệm của Controller:

```text
parse request
xác thực request
xác định bối cảnh bảo mật/actor
gọi use case tầng application
ánh xạ kết quả sang response
```

Controller tuyệt đối không được:
- Gọi trực tiếp JPA repository;
- Trực tiếp thay đổi trạng thái của entity;
- Cài đặt chính sách nghiệp vụ;
- Tự điều phối các transaction phức tạp;
- Truy cập vào persistence của module khác.

Ví dụ mục tiêu:

```java
@RestController
@RequiredArgsConstructor
class AdminRoleController {

    private final RoleQueryUseCase roleQueryUseCase;

    @GetMapping
    ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(
                roleQueryUseCase.getRoles()
                        .stream()
                        .map(RoleResponse::from)
                        .toList()
        );
    }
}
```

## 6. Quy tắc tầng Application

Tầng Application nắm giữ việc điều phối use case và thông thường sẽ là nơi xác định ranh giới transaction.

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
        ...
    }
}
```

Mã nguồn trong Application nên phụ thuộc vào các output port hoặc API của module, không phụ thuộc vào các lớp triển khai cụ thể của bên thứ ba / hạ tầng.

## 7. Quy tắc Transaction

Backend hiện tại của Ladux chứa nhiều luồng xử lý có tính chất sống còn về tính nhất quán.

Không được thay đổi ngữ nghĩa transaction trong quá trình di chuyển package trừ khi tác vụ đó có mục tiêu thiết kế lại hành vi một cách rõ ràng.

Một transaction hợp lệ trong Modular Monolith có thể đi xuyên qua các API của module logic:

```text
@Transactional Ordering.cancel(...)
    |
    +--> Inventory.release(...)
    +--> Promotion.rollback(...)
    +--> cập nhật trạng thái Ordering
```

Quy tắc:
1. Use case / application service làm chủ transaction;
2. Lỗi nghiêm trọng phải được lan truyền (propagate) để rollback;
3. Lời gọi đồng bộ chéo module có thể tham gia vào cùng một transaction;
4. Mặc định không thay thế các lời gọi quan trọng bằng event bất đồng bộ;
5. Bảo toàn các thiết lập propagation hiện có như `MANDATORY` khi nó thể hiện một bất biến thực sự;
6. Bảo toàn hành vi khóa bi quan (pessimistic lock) / cập nhật nguyên tử (atomic update).

## 8. Quy tắc Event

Không sử dụng event chỉ vì tư tưởng "event giúp giảm coupling".

Nguyên tắc quyết định:

```text
bất biến quan trọng
    -> API đồng bộ + transaction

tác vụ phụ không quan trọng
    -> event

chuyển phát tin cậy qua tiến trình trong tương lai
    -> transactional outbox
```

Ví dụ:

```text
Hủy đơn hàng (Order cancellation)
├── giải phóng kho      -> đồng bộ
├── hoàn trả coupon     -> đồng bộ
└── thông báo khách hàng -> event / sau khi commit
```

## 9. Quy tắc Persistence

Triển khai Repository thuộc về module sở hữu nó.

Trạng thái mục tiêu bị cấm:

```text
ordering.application -> ProductRepository
payment.application -> OrderRepository
procurement.application -> ProductVariantRepository
```

Ưu tiên:

```text
ordering.application -> CatalogVariantQuery
payment.application -> OrderingPaymentApi
procurement.application -> CatalogVariantQuery
```

## 10. Chiến lược về độ thuần khiết của Domain

Không ép buộc "cấm hoàn toàn JPA trong domain" trên toàn bộ repository ngay lập tức.

### Tính module hóa cơ sở — bắt buộc sau khi di chuyển

- Không truy cập repository ngoại lai;
- Không import infrastructure ngoại lai;
- Không để lộ JPA entity qua ranh giới module;
- Không để controller gọi trực tiếp repository;
- Không có chu trình phụ thuộc vòng;
- API công khai của module phải tường minh.

### Clean Architecture nghiêm ngặt — áp dụng có chọn lọc

Chỉ áp dụng khi thực sự mang lại giá trị cho:

```text
Payment
Ranh giới bảo mật / nhà cung cấp của Identity
Chính sách vòng đời của Ordering
Chính sách kho phức tạp của Inventory
```

Quy tắc nghiêm ngặt tiềm năng:

```text
domain -X-> Spring
domain -X-> Jakarta Persistence
application -X-> concrete adapters
```

Các tính năng CRUD của Catalog không cần thiết phải nhân bản model domain/JPA chỉ vì mục đích lý thuyết thuần túy.

## 11. REST DTO so với DTO của Module API

Đây là hai mối quan tâm tách biệt nhau.

Cấu trúc gợi ý:

```text
catalog/api/ProductView.java
catalog/infrastructure/web/dto/ProductResponse.java
```

Không để các module khác phụ thuộc vào các REST DTO.

Không sử dụng các web response record làm contract giao tiếp nội bộ giữa các module.

## 12. Quy tắc cho package Shared

Được phép:

```text
ordering -> shared
catalog  -> shared
payment  -> shared
```

Bị cấm:

```text
shared -> ordering
shared -> catalog
shared -> payment
```

Một kiểu dữ liệu được hai module cùng sử dụng không tự động biến nó thành "shared".

Nếu kiểu đó mang ngữ nghĩa nghiệp vụ rõ ràng, module sở hữu nó phải phơi bày ra thông qua API của chính module đó.

## 13. Bảng ma trận chéo module

| Bên gọi (Consumer) | Identity | Catalog | Ordering | Payment | Inventory | Procurement | Promotion | Notification |
|---|---|---|---|---|---|---|---|---|
| Identity | — | — | — | — | — | — | — | event tùy chọn |
| Catalog | ID/API tùy chọn | — | — | — | — | — | — | event |
| Ordering | user/actor ID | API | — | — | API | — | API | EVENT |
| Payment | user/actor ID | — | API | — | — | — | — | EVENT |
| Inventory | — | API | — | — | — | — | — | EVENT |
| Procurement | actor ID | API | — | — | API | — | — | EVENT |
| Promotion | — | — | — | — | — | — | — | EVENT |
| Notification | Identity API tùy chọn | payload của event | payload của event | payload của event | payload của event | payload của event | payload của event | — |

Mọi trường hợp ngoại lệ đều phải được ghi lại trong tài liệu ADR.

## 14. Quy tắc Flyway

Các file migration hiện có là lịch sử bất biến.

Tuyệt đối không:
- Chỉnh sửa file `V*.sql` đã được áp dụng;
- Đổi tên migration đã được áp dụng;
- Thay đổi thứ tự migration đã áp dụng;
- Xóa migration đã áp dụng.

Nếu cần thay đổi schema:
1. Tạo một file migration mới;
2. Duy trì khả năng tương thích ngược khi cần thiết;
3. Chạy kiểm thử migration / tích hợp;
4. Nêu rõ rủi ro dữ liệu và phương án phục hồi.

Việc tái cấu trúc package không được phép kích hoạt sửa đổi DB migration trừ khi thực sự cần thiết.

## 15. Checklist rà soát

- [ ] Code nằm đúng trong module sở hữu.
- [ ] Không phát sinh thêm truy cập repository ngoại lai.
- [ ] Không có API module công khai nào để lộ JPA entity.
- [ ] Không có controller nào gọi trực tiếp repository.
- [ ] Không có class application nào phụ thuộc vào triển khai cụ thể của infrastructure.
- [ ] Không tạo ra phụ thuộc vòng giữa các module.
- [ ] Ngữ nghĩa transaction được bảo toàn.
- [ ] Cơ chế locking được bảo toàn.
- [ ] Contract REST API không bị thay đổi trừ khi có yêu cầu rõ ràng.
- [ ] Lịch sử Flyway không bị chỉnh sửa.
- [ ] Các bài kiểm thử kiến trúc (ArchUnit) bao phủ được ranh giới mới.
