# ADR-001 — Modular Monolith theo Miền Nghiệp vụ kết hợp Kiến trúc Clean/Hexagonal có chọn lọc

**Trạng thái:** Đã chấp thuận (Accepted)  
**Ngày:** 2026-09-13  
**Phạm vi:** `backend/`

## Bối cảnh (Context)

Ladux đã phát triển vượt ra khỏi quy mô của một ứng dụng CRUD thông thường.

Codebase hiện tại bao gồm nhiều mảng nghiệp vụ như:
- Catalog (danh mục sản phẩm);
- Ordering (đặt hàng);
- Payment (thanh toán);
- Inventory (kho vận);
- Procurement (thu mua);
- Promotion (khuyến mãi);
- Authentication / bảo mật;
- Notification (thông báo).

Ứng dụng cũng chứa nhiều chi tiết hạ tầng kỹ thuật và hành vi có tính nhạy cảm cao về tính nhất quán:
- Redis;
- Flyway;
- Scheduled jobs (tác vụ định kỳ);
- ShedLock;
- Xử lý webhook thanh toán;
- Sổ cái tồn kho (stock ledger);
- MFA / OTP / JWT;
- Vòng đời đơn hàng quản lý theo transaction;
- Kiểm thử tích hợp (integration tests).

Tuy nhiên, mã nguồn vẫn đang được tổ chức chủ yếu theo các tầng kỹ thuật:

```text
controller/
service/
repository/
model/
```

Khi dự án tiếp tục mở rộng, cách tổ chức này làm mờ nhạt quyền sở hữu logic và tạo điều kiện cho các truy cập repository tùy tiện xuyên miền nghiệp vụ.

Một số luồng nghiệp vụ hiện tại cũng dựa vào tính nhất quán giao dịch mạnh mẽ (strong transactional consistency). Việc phân tách thành microservices ngay lúc này sẽ đưa vào sự phức tạp lớn về tính nhất quán phân tán và chi phí vận hành mà chưa hề có nhu cầu thực sự.

## Quyết định (Decision)

Ladux sẽ được di chuyển từng bước sang:

> **Modular Monolith theo miền nghiệp vụ (business domain) + áp dụng có chọn lọc Kiến trúc Clean/Hexagonal**

Các module cấp cao nhất:

```text
identity
catalog
ordering
payment
inventory
procurement
promotion
notification
shared
```

Ứng dụng vẫn tiếp tục là:

```text
một ứng dụng Spring Boot duy nhất
một đơn vị triển khai duy nhất (deployable unit)
dùng chung một PostgreSQL ban đầu
dùng chung một Redis ban đầu
```

Chiều phụ thuộc mã nguồn chéo module:

```text
module A -> module B.api
```

Tuyệt đối không được phép:

```text
module A -> module B.repository
module A -> module B.infrastructure
module A -> module B JPA entity nội bộ
```

Kiến trúc Clean/Hexagonal được ưu tiên áp dụng có chọn lọc cho các ranh giới có giá trị cao như:

```text
Payment -> VNPay
Identity -> Email/SMS/CAPTCHA/OAuth
Ordering -> Inventory
Procurement -> Inventory
```

## Lý do / Cơ sở quyết định (Rationale)

### 1. Giúp năng lực nghiệp vụ hiển hiện rõ ràng trong codebase

Mục tiêu:

```text
catalog/
ordering/
payment/
inventory/
```

thay vì phải tìm kiếm logic nghiệp vụ rải rác trong các thư mục kỹ thuật toàn cục.

### 2. Bảo toàn lợi thế về transaction của Monolith

Các luồng nghiệp vụ đòi hỏi tính nhất quán cao có thể tiếp tục nằm gọn trong cùng một database transaction.

Ví dụ:

```text
hủy đơn hàng
    ->
giải phóng tồn kho
    ->
hoàn trả coupon
    ->
cập nhật đơn hàng
```

Không cần thiết phải ép buộc áp dụng tính nhất quán sau cùng (eventual consistency) trong giai đoạn di chuyển kiến trúc này.

### 3. Giảm bớt sự liên kết ngẫu nhiên (accidental coupling)

Các module phơi bày các contract công khai gọn gàng thay vì để lộ chi tiết nội bộ của repository/entity.

### 4. Các nhà cung cấp bên ngoài trở thành adapter dễ dàng thay thế

Ví dụ:

```text
PaymentGatewayPort
    |
    +-- VNPayAdapter
    +-- MoMoAdapter trong tương lai
```

### 5. Kiến trúc có thể được kiểm chứng tự động

Sử dụng:

```text
tài liệu kiến trúc
+
ArchUnit
+
các bước kiểm tra bắt buộc trên CI
```

thay vì chỉ trông đợi vào trí nhớ của lập trình viên hoặc AI agent.

## Các phương án thay thế đã xem xét (Alternatives considered)

### A. Giữ nguyên cấu trúc phân tầng toàn cục (package-by-layer)

Ưu điểm:
- Thay đổi tối thiểu;
- Quen thuộc.

Nhược điểm:
- Quyền sở hữu nghiệp vụ không rõ ràng;
- Dễ phát sinh truy cập repository chéo;
- Sự phụ thuộc lẫn nhau tăng dần theo quy mô dự án.

**Quyết định:** Bác bỏ việc coi đây là mục tiêu dài hạn.

### B. Áp dụng Clean Architecture toàn diện ở mọi nơi ngay lập tức

Ví dụ các nghi thức bắt buộc:

```text
DomainEntity
JpaEntity
Mapper
RepositoryPort
RepositoryAdapter
```

cho mọi model.

Ưu điểm:
- Tách biệt framework ở mức tối đa.

Nhược điểm:
- Chi phí di chuyển cực lớn;
- Rất nhiều code lặp lại (boilerplate);
- Khó phân định giữa giá trị thực tế và thủ tục hình thức;
- Nguy cơ hồi quy (regression) cao ở các luồng giao dịch phức tạp.

**Quyết định:** Bác bỏ chiến lược làm một lần toàn diện (big-bang).

Clean Architecture nghiêm ngặt chỉ được áp dụng có chọn lọc.

### C. Chuyển đổi sang Microservices

Phân tách các module thành các dịch vụ độc lập:

```text
catalog-service
order-service
payment-service
inventory-service
```

Ưu điểm tiềm năng:
- Khả năng triển khai / scale độc lập nếu thực sự phát sinh nhu cầu.

Chi phí tức thời:
- Phải xử lý lỗi mạng;
- Xác thực giữa các dịch vụ;
- Cơ chế thử lại (retry) / tính lũy kế (idempotency);
- Phân phối tin nhắn/sự kiện;
- Nhất quán sau cùng (eventual consistency);
- Distributed tracing (truy vết phân tán);
- Quá nhiều đơn vị triển khai;
- Mất đi tính tiện lợi của transaction trên DB chung.

**Quyết định:** Bác bỏ trong giai đoạn hiện tại.

Chỉ xem xét lại khi có lý do đo lường được về quy mô đội ngũ / lưu lượng truy cập / độ tin cậy / nhu cầu triển khai độc lập.

### D. Áp dụng Spring Modulith ngay lập tức

Spring Modulith tương thích tốt với thiết kế mục tiêu và có thể cung cấp thêm:
- Kiểm tra cấu trúc;
- Kiểm thử theo module;
- Sinh tài liệu kiến trúc.

**Quyết định:** Tạm hoãn / là tùy chọn sau này.

Trước mắt bắt đầu với ranh giới package + ArchUnit.

## Hệ quả (Consequences)

### Tích cực

- Quyền sở hữu miền nghiệp vụ rõ ràng hơn;
- Giảm thiểu sự liên kết ngẫu nhiên;
- Dễ dàng tiếp cận dự án cho người mới (onboarding);
- An toàn hơn khi sử dụng AI agent để sinh code;
- Dễ dàng thay thế các nhà cung cấp bên thứ ba;
- Kiến trúc có thể kiểm thử tự động;
- Vẫn giữ được sự đơn giản khi triển khai của monolith;
- Tạo sẵn các đường cắt (seam) thuận lợi nếu cần tách dịch vụ sau này.

### Tiêu cực

- Quá trình di chuyển cần thời gian;
- Tồn tại cấu trúc lai tạm thời trong giai đoạn chuyển tiếp;
- Cần khai báo thêm các API/mapper tường minh;
- Cần duy trì một số class bridge tạm thời;
- Phải bảo trì thêm các bài test kiến trúc.

## Trạng thái chuyển tiếp được chấp nhận (Accepted transition state)

Trạng thái sau hoàn toàn hợp lệ trong quá trình di chuyển:

```text
catalog/
controller/
service/
repository/
model/
```

đồng thời cùng tồn tại, miễn là:
- Ranh giới của module đã di chuyển được bảo vệ nghiêm ngặt;
- Không phát sinh thêm nợ kỹ thuật ở code legacy;
- Tiếp tục thực hiện các cột mốc di chuyển tiếp theo.

## Phương pháp tiếp cận di chuyển (Migration approach)

```text
đặc tả hành vi (characterize behavior)
    ->
tạo ranh giới công khai (introduce public seam)
    ->
điều hướng bên tiêu thụ (redirect consumers)
    ->
di chuyển code nội bộ (move internals)
    ->
thêm kiểm thử ArchUnit
    ->
chạy verify toàn bộ
```

Trình tự khuyến nghị:

```text
Foundation (Nền tảng)
Catalog
Promotion
Inventory
Procurement
Ordering
Payment
Identity
Notification
Hardening (Gia cố)
```

## Tiêu chí nghiệm thu (Acceptance criteria)

- [ ] Tài liệu kiến trúc được commit đầy đủ;
- [ ] Quy tắc cho Agent (AGENT.md) được commit;
- [ ] Bổ sung ArchUnit;
- [ ] CI tự động chạy các bài kiểm thử kiến trúc;
- [ ] Module Catalog được di chuyển đầu tiên;
- [ ] Các module khác không truy cập nội bộ Catalog;
- [ ] Inventory sở hữu hoàn toàn việc thay đổi tồn kho;
- [ ] Ordering không truy cập repository của Inventory/Promotion;
- [ ] Payment không truy cập repository của Ordering;
- [ ] VNPay nằm phía sau port của Payment;
- [ ] Các REST contract công khai giữ nguyên khả năng tương thích;
- [ ] Lịch sử Flyway giữ nguyên bất biến;
- [ ] Lệnh Maven verify chạy pass hoàn toàn.

## Xem xét lại ADR này khi nào (Revisit this ADR when)

Xem xét lại quyết định nếu một hoặc nhiều điều kiện sau xuất hiện:
- Một module cần triển khai độc lập vì lý do lưu lượng truy cập đo lường được;
- Một đội ngũ kỹ sư riêng biệt chịu trách nhiệm trọn vẹn một bounded context;
- Chu kỳ release cần phải tách biệt độc lập;
- Transaction trên cơ sở dữ liệu chung trở thành điểm nghẽn hiệu năng đo lường được;
- Ranh giới module đủ ổn định để ước tính chính xác chi phí tách dịch vụ;
- Yêu cầu về độ tin cậy đòi hỏi sự cô lập lỗi độc lập hoàn toàn.

Tuyệt đối không tách microservices chỉ vì cảm tính rằng codebase đang "lớn dần lên".
