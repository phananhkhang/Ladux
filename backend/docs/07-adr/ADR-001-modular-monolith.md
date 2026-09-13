# ADR-001 — Modular Monolith và Clean/Hexagonal có chọn lọc

- Trạng thái: Quyết định kiến trúc mục tiêu; mức hoàn thành triển khai phải được xác nhận riêng.
- Phạm vi: Backend Ladux.
- Bản cập nhật tài liệu: 2026-09-13.
- Thay thế kiến trúc triển khai: Không; vẫn một ứng dụng và một đơn vị triển khai.

## 1. Bối cảnh

Bộ tài liệu đầu vào mô tả backend tổ chức theo tầng kỹ thuật toàn cục, có liên kết service/repository/entity giữa các nghiệp vụ. Checkout, tồn kho, coupon, order lifecycle và payment đòi hỏi bảo toàn transaction, lock và tính lũy đẳng. Các tích hợp VNPay, Redis, email/SMS, OAuth2 và scheduler cần ranh giới rõ để thay đổi/kiểm thử an toàn.

Đánh giá tài liệu cho thấy hướng Modular Monolith phù hợp, nhưng quy tắc ownership chưa đủ để ngăn ghi stock ngoài Inventory; chiều Payment → Ordering thiếu nơi điều phối checkout kết hợp; event hậu commit chưa có tiêu chí durability thống nhất; rule kiến trúc cần bảo vệ API và cycle từ đầu. Các vấn đề này được giải quyết trong bản quyết định cập nhật.

Không có kết luận từ ADR này về hiệu năng, độ sẵn sàng production hoặc mức đạt kiến trúc của repository hiện tại. Chúng phải được xác minh bằng source, test và số liệu vận hành.

## 2. Quyết định

Tiếp tục **Modular Monolith theo năng lực nghiệp vụ**, một Spring Boot deployable, PostgreSQL và Redis dùng chung. Tám module nghiệp vụ: Identity, Catalog, Ordering, Payment, Inventory, Procurement, Promotion, Notification; thêm shared cho primitive/hạ tầng chung thực sự.

Áp dụng Clean/Hexagonal tại ranh giới có giá trị: persistence phục vụ use case, payment gateway, email/SMS/CAPTCHA/OAuth, Redis và giao tiếp module. Không bắt buộc domain thuần framework ở mọi nơi, một class cho mỗi GET, hoặc hai model domain/JPA giống nhau. Tư tưởng port/adapter bảo vệ chính sách khỏi chi tiết tích hợp; cấu trúc cụ thể được chọn theo nhu cầu Ladux. [Alistair Cockburn: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture).

API chéo module ở `*.api`, không lộ entity/repository/SDK. Domain không phụ thuộc module khác. Ma trận import duy nhất tại [quy tắc phụ thuộc](../03-dependency-rules.md#2-ma-tran-phu-thuoc).

### 2.1 Workflow khi cần điều phối

Cho phép `workflow` như lớp application/infrastructure mỏng gọi các business API. Không module nghiệp vụ nào phụ thuộc workflow; workflow không sở hữu entity, repository hoặc bảng nghiệp vụ.

Checkout yêu cầu order và local payment attempt cùng transaction được điều phối tại workflow, giữ Payment → Ordering và không thêm chiều ngược. Các luồng đọc Catalog + availability, xác minh review từ đơn đã mua, hoặc bridge event sang điểm Customer hiện có cũng có thể dùng workflow để tránh cycle. Không tạo workflow cho các CRUD đơn module hoặc đưa toàn bộ nghiệp vụ vào đó.

### 2.2 Inventory là writer duy nhất

Giữ schema vật lý hiện hữu khi có thể, nhưng loại mọi writer stock ngoài Inventory. Catalog mapping không cập nhật cột stock; init stock, native SQL, import/job, optimistic version và cache đều phải được kiểm soát. Inventory adapter được phép truy cập phạm vi cột stock/khóa/version cụ thể trên bảng biến thể trong giai đoạn chuyển tiếp, không import Catalog persistence.

Tách bảng stock là lựa chọn schema về sau nếu có lợi ích đã chứng minh. Không tạo bảng mới chỉ để làm đẹp sơ đồ; không để physical schema thành lý do hợp thức hóa nhiều writer.

### 2.3 Nhất quán và tích hợp bên ngoài

Các thay đổi DB cốt lõi cần atomic dùng API đồng bộ trong cùng transaction. Coordinator không biến transaction DB thành transaction phân tán với HTTP/Redis. Payment/refund remote dùng intent bền, operation ID, state machine, retry an toàn và đối soát khi chưa rõ kết quả.

Event bắt buộc không mất phải được lưu cùng transaction với nghiệp vụ bằng outbox hoặc publication registry bền; áp dụng ngay cả trong một process. Listener hậu commit đơn thuần chỉ thích hợp khi chấp nhận khả năng mất. Consumer lũy đẳng và cơ chế phục hồi là bắt buộc cho event bền. Không thay core stock/coupon operation bằng event hậu commit.

### 2.4 Thực thi ranh giới

Bật ArchUnit và cycle gate từ Foundation; baseline có kiểm soát cho vi phạm legacy, không thêm vi phạm mới. Module chỉ hoàn tất khi ranh giới của nó chạy strict và ngoại lệ tạm đã được gỡ. Có fixture kiểm tra chính rule, cùng integration test cho các bất biến mà bytecode không chứng minh được.

Spring Modulith có thể bổ sung verification hoặc durable publication khi phù hợp stack, nhưng không bắt buộc chỉ vì tên kiến trúc là modular monolith. Nếu dùng, cấu hình export `*.api` đúng với named interface và phiên bản thực tế. [Modulith fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html).

## 3. Lựa chọn đã cân nhắc

| Lựa chọn | Lợi ích | Hạn chế và quyết định |
| --- | --- | --- |
| Giữ layered monolith toàn cục | Ít thay đổi ngay | Ownership/import dễ lan rộng, khó bảo vệ invariant; không chọn làm mục tiêu |
| Modular Monolith, Hexagonal chọn lọc | Ranh giới rõ, giữ DB transaction và vận hành đơn giản | Cần CI và discipline để ranh giới có hiệu lực; được chọn |
| Clean nghiêm ngặt toàn bộ | Cô lập framework đồng đều | Nhiều mapping/abstraction ít giá trị cho CRUD; không bắt buộc |
| Microservices ngay | Có thể triển khai/scale riêng | Phát sinh nhất quán phân tán và vận hành chưa có yêu cầu chứng minh; ngoài phạm vi |
| Cho module gọi nhau hai chiều | Viết workflow trước mắt nhanh | Tạo cycle và khó cô lập; không chọn |
| Event hóa mọi luồng | Tách thời điểm thực thi | Không giữ được atomic checkout nếu thiếu thiết kế khác; không chọn |

## 4. Hệ quả

Phát triển tiếp được với mức đầu tư kiến trúc có giới hạn: tách API đúng ranh giới, gom query đơn giản, không nhân đôi model vô ích. Giá phải trả là mapping snapshot, kiểm kê writer, duy trì gate và xử lý durability/idempotency cho hiệu ứng bên ngoài.

Workflow có nguy cơ thành service tổng hợp quá lớn: hạn chế bằng quy tắc không sở hữu dữ liệu, một luồng phối hợp có trách nhiệm rõ và giữ invariant trong module. Shared có nguy cơ thành kho chứa tùy tiện: primitive xuất ở `shared.api`, adapter/cấu hình nội bộ không thành đường vòng dependency.

Shared DB hỗ trợ transaction nhưng không tự ngăn truy cập bảng trái quyền; cần review SQL và test. Outbox/registry tạo công việc vận hành backlog/retry/replay, nhưng cần thiết khi nghiệp vụ không chấp nhận mất sự kiện. Không tuyên bố exactly-once end-to-end nếu provider không hỗ trợ.

## 5. Di chuyển và nghiệm thu

Thực hiện [kế hoạch tăng dần](../04-migration-plan.md), bắt đầu Foundation và pilot Catalog nhỏ; chỉ đóng Catalog khi xong seam liên quan Inventory và foreign association. Tạo các API tối thiểu sớm theo dependency, di chuyển đầy đủ module theo rủi ro và coverage.

Giữ REST contract, transaction/lock, pricing/coupon semantics, JWT/MFA/OTP, cache/job và Flyway history. Schema durability/idempotency mới phải có migration mới cùng rollout/rollback tương thích. Không gộp nâng framework hoặc tính năng không liên quan.

Nghiệm thu dựa trên gate kiến trúc strict cho phần đã đóng, test behavior/concurrency/failure phù hợp, `verify` thực sự chạy test cần thiết và không còn writer trái quyền. Bản tài liệu không thay thế các bằng chứng này.

## 6. Khi nào xem xét lại ADR

Xem xét khi có nhu cầu triển khai độc lập, cô lập lỗi, đội ngũ sở hữu độc lập hoặc điểm nghẽn tải được đo rõ mà tối ưu trong monolith không giải quyết hợp lý; hoặc khi workflow cần state lâu dài riêng làm thay đổi ownership. ADR mới phải chỉ ra lợi ích, transaction/data migration, vận hành và rollback, không chỉ tên công nghệ mong muốn.

## 7. Tài liệu liên quan

- [Kiến trúc mục tiêu](../01-target-architecture.md)
- [Ranh giới module](../02-module-boundaries.md)
- [Quy tắc phụ thuộc](../03-dependency-rules.md)
- [Kế hoạch di chuyển](../04-migration-plan.md)
- [ArchUnit](../05-archunit-rules.md)
- [Ví dụ refactor](../06-examples-refactor.md)
