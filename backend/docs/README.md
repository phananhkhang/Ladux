# Tài liệu Kiến trúc Backend Ladux

Thứ tự đọc tài liệu khuyến nghị:

1. `01-target-architecture.md`
2. `02-module-boundaries.md`
3. `03-dependency-rules.md`
4. `04-migration-plan.md`
5. `05-archunit-rules.md`
6. `06-examples-refactor.md`
7. `07-adr/ADR-001-modular-monolith.md`

## Quyết định cốt lõi

Backend Ladux sẽ được di chuyển (migrate) từng bước từ kiến trúc monolith phân tầng kỹ thuật (layered monolith) sang:

> **Modular Monolith theo năng lực nghiệp vụ (business capability) + áp dụng có chọn lọc Kiến trúc Clean/Hexagonal**

Việc tách thành microservices **không** nằm trong phạm vi của đợt di chuyển này.

## Các module chính

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

## Các ràng buộc di chuyển bất di bất dịch

- Mặc định giữ nguyên các contract REST hiện có;
- Bảo toàn ngữ nghĩa transaction và cơ chế locking;
- Bảo toàn hành vi nguyên tử (atomic) của checkout/inventory/order/payment;
- Tuyệt đối không chỉnh sửa các migration Flyway đã được áp dụng;
- Không để lộ JPA entity ra ngoài ranh giới module;
- Không thêm mới các truy cập repository chéo module;
- Thực thi ranh giới các module đã di chuyển bằng ArchUnit;
- Di chuyển theo từng bước tăng dần, mỗi lần một bounded context.
