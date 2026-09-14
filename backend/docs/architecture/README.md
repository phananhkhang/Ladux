# Tài liệu kiến trúc Backend Ladux

Ladux tiếp tục dùng **Modular Monolith theo năng lực nghiệp vụ, áp dụng Clean/Hexagonal có chọn lọc**: một ứng dụng Spring Boot, một đơn vị triển khai, dùng chung PostgreSQL và Redis. Bộ tài liệu này quy định kiến trúc mục tiêu và điều kiện di chuyển; không xác nhận rằng mã nguồn hiện tại đã đạt các điều kiện đó.

## Cách dùng

Đặt `AGENT.md` tại `backend/AGENT.md` và thư mục này tại `backend/docs/architecture/`. Các tên file đã được chuẩn hóa, bỏ hậu tố bản tải xuống.

| Thứ tự | Tài liệu | Nội dung có thẩm quyền |
| --- | --- | --- |
| 1 | [Kiến trúc mục tiêu](01-target-architecture.md) | Cấu trúc, mức độ áp dụng Hexagonal, transaction và điều phối |
| 2 | [Ranh giới module](02-module-boundaries.md) | Chủ sở hữu dữ liệu và bất biến nghiệp vụ |
| 3 | [Quy tắc phụ thuộc](03-dependency-rules.md) | Ma trận import, API, persistence và event |
| 4 | [Kế hoạch di chuyển](04-migration-plan.md) | Các giai đoạn, bằng chứng nghiệm thu và rollback |
| 5 | [Quy tắc ArchUnit](05-archunit-rules.md) | Kiểm tra tự động, baseline và CI |
| 6 | [Ví dụ refactor](06-examples-refactor.md) | Mẫu triển khai và các trường hợp cần kiểm chứng |
| 7 | [ADR-001](07-adr/ADR-001-modular-monolith.md) | Quyết định, lựa chọn thay thế và hệ quả |
| 8 | [Quy tắc cho coding agent](../../AGENT.md) | Hướng dẫn làm việc ngắn gọn trong backend |

Khi sửa một quyết định, cập nhật tài liệu có thẩm quyền và những ví dụ liên quan trong cùng thay đổi. Không sao chép ma trận phụ thuộc sang nhiều nơi rồi duy trì độc lập.

## Các quyết định chính

- Tám module nghiệp vụ: `identity`, `catalog`, `ordering`, `payment`, `inventory`, `procurement`, `promotion`, `notification`.
- `shared` chỉ chứa primitive và hạ tầng chung không mang chính sách nghiệp vụ.
- `workflow` là lớp điều phối kỹ thuật mỏng cho luồng cần gọi nhiều API mà nếu đặt trong module nghiệp vụ sẽ tạo vòng phụ thuộc. Chỉ tạo khi có luồng cụ thể; không sở hữu entity, repository hoặc bảng nghiệp vụ.
- Giao tiếp chéo module qua `*.api`; hướng phụ thuộc chính thức nằm trong [ma trận](03-dependency-rules.md#2-ma-tran-phu-thuoc).
- Inventory là nơi duy nhất được ghi tồn kho, kể cả khi cột còn nằm trên bảng biến thể sản phẩm.
- Các thay đổi DB cốt lõi cần nguyên tử dùng lời gọi đồng bộ trong cùng transaction. Hiệu ứng hậu commit không được phép mất cần lưu bền và xử lý lũy đẳng.
- Không bắt buộc một use case cho mỗi GET, không nhân đôi domain/JPA model một cách máy móc.

## Những điểm đã làm rõ trong bản cập nhật

1. Bổ sung điều phối checkout/payment và các luồng đọc cần phối hợp nhiều module mà không tạo dependency cycle.
2. Chuyển quy tắc “Inventory sở hữu tồn kho” thành yêu cầu kiểm soát writer, mapping JPA, locking và ledger cụ thể.
3. Phân biệt transaction DB với lời gọi cổng thanh toán; bổ sung refund intent, trạng thái chưa rõ kết quả và đối soát.
4. Thống nhất độ bền event: chạy sau commit chưa có nghĩa là không mất sự kiện.
5. Đưa API leakage, chiều phụ thuộc, cycle và ngoại lệ legacy vào kế hoạch kiểm tra ngay từ đầu.
6. Chia Catalog thành pilot và hoàn tất ranh giới, tránh tuyên bố module hoàn thành trong khi còn truy cập nội bộ chéo module.
7. Rút gọn `AGENT.md`, sửa thuật ngữ **tính lũy đẳng** và thống nhất tên file.

## Điều kiện để tiếp tục phát triển an toàn

Có thể tiếp tục phát triển theo hướng này. Với mỗi phần đã di chuyển, chỉ coi ranh giới ổn định khi đã có kiểm tra kiến trúc, kiểm thử hành vi trọng yếu, không thêm ngoại lệ legacy, và xác định rõ transaction cùng chủ sở hữu dữ liệu.

Trước khi thay luồng checkout, tồn kho hoặc thanh toán, cần baseline từ mã nguồn thực tế và bằng chứng kiểm thử đồng thời/lỗi giữa chừng. Các đoạn Java trong bộ tài liệu là mẫu thiết kế, chưa được biên dịch hay chạy với repository Ladux trong lần chỉnh tài liệu này.
