# Backend Ladux — Quy tắc dành cho coding agent

Phạm vi: `backend/`. Kiến trúc mục tiêu: **Modular Monolith theo nghiệp vụ, Clean/Hexagonal có chọn lọc**. Tên file chính thức trong bộ tài liệu là `AGENT.md`; đường dẫn này không tự đảm bảo mọi công cụ sẽ tự đọc file, nên cấu hình công cụ theo cơ chế thực tế của repository.

Đây là hướng dẫn phát triển, không phải xác nhận source hiện tại đã đáp ứng kiến trúc. Không báo module hoàn thành hoặc test pass nếu chưa có bằng chứng.

## 1. Tài liệu có thẩm quyền

Đọc [README kiến trúc](docs/architecture/README.md) và tài liệu liên quan đến phần đang sửa:

- [Kiến trúc mục tiêu](docs/architecture/01-target-architecture.md): cấu trúc, transaction, workflow và mức áp dụng Hexagonal.
- [Ranh giới module](docs/architecture/02-module-boundaries.md): ownership và invariant.
- [Quy tắc phụ thuộc](docs/architecture/03-dependency-rules.md): nguồn duy nhất của ma trận import.
- [Kế hoạch di chuyển](docs/architecture/04-migration-plan.md): baseline, gate, rollout/rollback.
- [ArchUnit](docs/architecture/05-archunit-rules.md): rule, fixture và baseline legacy.
- [Ví dụ refactor](docs/architecture/06-examples-refactor.md): mẫu thiết kế, chưa phải code đã kiểm chứng.
- [ADR-001](docs/architecture/07-adr/ADR-001-modular-monolith.md): quyết định và lý do.

Không duy trì bản ma trận dependency riêng trong file này. Khi thay đổi quyết định, cập nhật tài liệu có thẩm quyền, code/rule và ví dụ liên quan cùng thay đổi.

## 2. Thứ tự ưu tiên

1. Tính đúng đắn nghiệp vụ, quyền truy cập và bảo mật.
2. Transaction consistency, locking và **tính lũy đẳng**: xử lý lặp không tạo thêm hiệu ứng.
3. Tương thích REST/API và dữ liệu triển khai.
4. Ownership, API module và chiều phụ thuộc.
5. Cô lập framework ở nơi có lợi ích; sự gọn gàng của package đứng sau tính đúng đắn.

Giữ một Spring Boot deployable, PostgreSQL và Redis dùng chung. Không thêm microservices, broker, Kubernetes hoặc nâng framework chỉ để di chuyển kiến trúc. Không trộn tính năng mới không liên quan vào refactor.

## 3. Cấu trúc và mức độ abstraction

Tám module nghiệp vụ: identity, catalog, ordering, payment, inventory, procurement, promotion, notification. Shared chứa primitive/hạ tầng chung không mang policy nghiệp vụ. Workflow chỉ xuất hiện khi có nhu cầu điều phối cụ thể và không có entity, repository hoặc bảng nghiệp vụ riêng.

- `api`: contract Java công khai cho module khác, không phải controller REST.
- `application`: use case, policy quyền nghiệp vụ, transaction và port.
- `domain`: invariant/model/state machine; không gọi module khác.
- `infrastructure`: web/persistence/integration/scheduling, triển khai port.
- `shared.api`: primitive xuất ra ngoài như actor, pagination, correlation; không có entity/SDK.

Không tạo thư mục hoặc interface rỗng cho đủ sơ đồ. Có thể gom query đơn giản trong `OrderQueries`; không bắt buộc một class cho mỗi GET. Tách command khi invariant/transaction/dependency khác nhau. Không bắt buộc nhân đôi mọi entity thành domain model và JPA model giống nhau.

Cho phép JPA annotation trong domain theo chính sách module, nhưng không cho entity association chéo module. Application không import concrete persistence/SDK. Interface chéo module nằm ở API; repository/output port thuộc application của chủ sở hữu.

Nếu controller ở package khác inject trực tiếp application class, class/method phải có visibility phù hợp, thường là `public`. Không coi annotation Spring là cách bỏ qua quy tắc truy cập Java.

## 4. Ranh giới và ownership

Module khác chỉ được import `*.api` theo ma trận chính thức. API không tham chiếu internals, API module khác, entity, Spring Data repository/Page hoặc kiểu SDK. Kiểm tra generic và DTO lồng nhau. Dùng ID/snapshot, batch API và DTO riêng cho REST khi cần.

Controller chỉ xử lý HTTP/actor/mapping rồi gọi application cùng module. Không repository/EntityManager/JDBC hoặc thay đổi domain trực tiếp. Controller của luồng phối hợp nằm trong workflow, vẫn giữ URL/JSON hiện có.

Không thêm `Ordering → Payment` khi Payment đã gọi Ordering; dùng workflow cho checkout/cancel cần cả hai API. Không thêm `Catalog → Inventory`; truy vấn product + availability ghép ở workflow. Không đặt listener import Ordering trong Identity để cập nhật Customer; bridge tại workflow nếu tính năng đó đã tồn tại.

Event import là consumer → publisher API, không phải hướng phát event lúc chạy. Đổi call thành event không tự loại bỏ dependency cycle. Nghiệp vụ không phụ thuộc workflow; shared không phụ thuộc nghiệp vụ.

## 5. Transaction, lock và idempotency

Trước khi đổi luồng, đọc source và lập bản đồ transaction manager, propagation, isolation, rollback exception, proxy, lock order, unique key và retry. Giữ nguyên semantics hiện có trừ thay đổi nghiệp vụ được giao rõ ràng.

- Core checkout, reserve/release, coupon redeem/rollback, order transition và receiving cần atomic thì dùng lời gọi đồng bộ cùng transaction.
- Không dùng `REQUIRES_NEW`, `@Async` hoặc event hậu commit cho bước phải rollback cùng nghiệp vụ.
- Không nuốt exception làm commit một phần; checked exception phải có rollback policy đúng.
- Self-invocation không tự đi qua Spring transaction proxy. Xác minh wiring thay vì chỉ nhìn annotation.
- Giữ thứ tự khóa nhất quán, khóa nhiều variant theo thứ tự ổn định, retry có giới hạn và lũy đẳng.
- Idempotency có scope, payload fingerprint và unique constraint trong DB; cùng key với payload khác là conflict. Không chỉ kiểm tra “exists” hoặc dùng Redis lock làm bảo đảm cuối cùng.

DB transaction không bao phủ HTTP/Redis/email. Không giữ khóa nghiệp vụ trong lúc gọi provider chậm; phân biệt ký URL cục bộ với network I/O.

## 6. Bất biến theo nghiệp vụ

### Ordering

Giữ kiểm tra tài khoản/quyền sở hữu giỏ, khóa giỏ, snapshot giá/địa chỉ, reserve stock/ledger, coupon, tạo order/item/history, dọn giỏ và bảo vệ IDOR. Nếu checkout có local payment attempt trong đơn vị nguyên tử, workflow điều phối Ordering và Payment trong transaction ngoài.

Transition phải qua state machine của Ordering; không có setter trạng thái tùy ý từ module khác. Cancel/expire/payment cạnh tranh phải có policy rõ. Cancelled không đồng nghĩa refunded; payment success đến muộn cần được ghi bền và xử lý ngoại lệ, không tự mở lại order.

### Inventory và Catalog

Inventory là writer duy nhất của stock và stock ledger, kể cả cột còn trên bảng ProductVariant. Catalog không ghi stock qua save/mapper/native SQL/import/job/admin endpoint. Mapping read-only, default/init stock, version, stale persistence context và cache phải xử lý theo tài liệu boundaries.

Stock và ledger cùng transaction. Reserve đủ số lượng mới thành công, không trừ lần hai ở confirm nếu reserve đã trừ availability. Release chỉ hoàn lượng đã reserve/chưa release; retry/cancel/expire không tăng stock hai lần. Không tách bảng chỉ để đẹp package; ngoại lệ SQL Inventory trên cột stock phải được giới hạn rõ.

### Promotion

Quote không bảo đảm quota đến lúc commit. Redeem kiểm tra lại điều kiện/limit nguyên tử; rollback tham chiếu redemption và lũy đẳng. Giữ thứ tự tính discount/làm tròn, không tin amount từ client, không gọi ngược Ordering.

### Procurement

PO/received quantity thuộc Procurement, stock/ledger thuộc Inventory. Receiving dùng receipt ID riêng cho mỗi lần nhận từng phần, ổn định khi retry; PO ID + variant ID không đủ. Chống payload mismatch, over-receive và nhận trùng bằng lock/unique constraint, cùng transaction với Inventory.

### Payment

Giữ kiểm tra chữ ký/reference/amount/currency, merchant reference unique và callback idempotency. IPN/đối soát đã xác minh cập nhật payment theo hợp đồng provider; Return URL không đủ chứng minh đã trả tiền. VNPay là adapter; chuyển đơn vị tiền, encoding/signature và response code nằm tại adapter.

Refund tạo intent bền trước HTTP, bảo vệ tổng refundable balance dưới concurrency, dùng định danh logic ổn định. Timeout có thể chưa rõ kết quả; phải đối soát/retry an toàn theo năng lực provider hoặc đưa vào xử lý vận hành. Không đánh dấu refunded ngay khi gửi request và không retry bằng request mới mù quáng.

### Identity

Không thiết kế lại auth trong refactor package. Giữ JWT/token version, refresh rotation/reuse/revocation, MFA challenge, OTP/email/phone verification, OAuth2, CAPTCHA, rate limit, password flow, TTL, lịch sử/sự kiện bảo mật.

Actor phải đến từ ngữ cảnh xác thực hoặc job principal có quyền; internal API vẫn kiểm tra authorization/invariant. Không xuất token, secret, OTP hoặc User entity ra API khác/log. OTP bảo mật có thể tiếp tục do Identity gửi qua port, không buộc qua Notification.

## 7. Event và tích hợp bên ngoài

Event ổn định thuộc publisher API, chứa event ID/aggregate reference/time và snapshot tối thiểu. Sau commit không đồng nghĩa async, retry hoặc durable.

- Hiệu ứng bắt buộc không mất: outbox/publication registry bền cùng transaction gốc; consumer lũy đẳng, retry/backoff, replay và theo dõi backlog.
- Hiệu ứng được phép mất: listener in-process chỉ khi chính sách đã nêu rõ; theo dõi lỗi.
- Hiệu ứng cần rollback transaction cốt lõi: API đồng bộ.

Không trì hoãn durability chỉ vì ứng dụng chạy một JVM. Listener hậu commit ghi DB phải có transaction mới/worker riêng. Dedup và hiệu ứng DB cùng commit; transaction thất bại không đánh dấu event đã xử lý. Không hứa exactly-once với email/payment provider không hỗ trợ.

Port tích hợp phải phân biệt timeout, lỗi xác định và kết quả chưa rõ; không nuốt lỗi hoặc log dữ liệu nhạy cảm. Core use case không import SDK nhà cung cấp.

## 8. Cache, Redis và scheduler

Khi đổi package, kiểm tra tên cache, key, TTL, serializer/tên class, thời điểm eviction và ranh giới phân quyền. Giữ hành vi hoặc có kế hoạch tương thích cho rollout nhiều phiên bản. Không dùng cache làm nguồn quyết định cuối cùng về stock/coupon/payment.

Redis là hạ tầng cho cache/rate limit/challenge/session/lock hỗ trợ; không đưa API Redis vào domain. Không thay TTL/key làm mất session/challenge trong một refactor hình thức.

Scheduler thuộc infrastructure module sở hữu nghiệp vụ; job phối hợp có thể vào workflow. Giữ cron/fixed delay, ShedLock name, lockAtMostFor/lockAtLeastFor, transaction và idempotency. Lock hết hạn có thể cho phép chạy chồng; không bỏ chống xử lý lặp vì đã có ShedLock.

## 9. REST và Flyway

Giữ endpoint, HTTP method/status, request/response JSON, validation, auth, authorization, pagination và error semantics trừ khi nhiệm vụ yêu cầu thay contract. Di chuyển controller không tự đổi API; snapshot DTO không tự làm đổi cấu trúc JSON frontend đang dùng.

Không sửa migration Flyway đã áp dụng. Thêm migration mới cho schema thật sự cần, bảo toàn dữ liệu và xác định expand/backfill/contract, tương thích bản cũ và điểm roll-forward. Không tuyên bố mọi refactor đều chỉ cần revert code nếu đã thay schema/status/event payload.

## 10. Quy trình trước, trong và sau thay đổi

**Trước:** xác định lát cắt, đọc ownership/rule, tìm caller/entity relation/SQL writer/config string, lập baseline transaction/API/cache/job/security và chạy test liên quan.

**Trong:** tạo API seam nhỏ, di chuyển implementation từng bước, giữ hành vi, thêm rule cho ranh giới mới. Bridge legacy có source/target chính xác, owner và điều kiện gỡ. Không wildcard cả module; không thêm vi phạm mới.

**Sau:** rà diff và wiring/scan/qualifier/SpEL/AOP/serializer; chạy gate và test rủi ro thực tế. Gỡ ngoại lệ đã giải quyết, cập nhật tài liệu. Không “đóng” Catalog chỉ vì pilot Brand/Category/Color đã xong.

Một task tập trung một lát cắt kiểm chứng được; cho phép thay đổi API tối thiểu ở module liên quan khi cần bảo toàn transaction. Không biến giới hạn phạm vi thành lý do cắt đôi một thao tác nguyên tử.

## 11. Kiểm thử và điều kiện hoàn thành

ArchUnit/cycle gate bật từ Foundation; baseline legacy không được tự nới trong CI. Kiểm tra API leak, allowed direction, domain/application/web, shared và module coverage không rỗng. Fixture phải chứng minh rule bắt được vi phạm, gồm generic entity và repository đổi tên.

Test transaction/concurrency bằng DB thật phù hợp, thường Testcontainers; mock không chứng minh lock/unique/rollback. Với phần thay đổi, bao phủ retry, duplicate, lỗi giữa chừng, race và authorization. Chạy target test khi phát triển, `./mvnw verify` làm gate theo profile repository; xác minh Failsafe/Surefire thực sự khám phá và chạy test yêu cầu.

Không skip test hoặc giảm rule chỉ để CI xanh. Nếu hạ tầng test không chạy được, báo rõ chưa kiểm chứng và không nhận hoàn thành ranh giới rủi ro cao. Không thêm test máy móc cho mọi thay đổi tài liệu/định dạng.

Module hoàn tất khi ownership/API đúng, ngoại lai chỉ gọi API theo ma trận, không entity/repository/SQL leak hoặc cycle, transaction/lock/security/API được bảo toàn, cache/job đã rà, gate/test yêu cầu pass và ngoại lệ tạm của module đã gỡ. Còn bridge thì ghi **đang chuyển tiếp**.

## 12. Xử lý bất định và báo cáo

Không đoán theo hướng phá hủy khi chưa rõ lock/idempotency, transaction không giữ được, nguy cơ mất dữ liệu hoặc contract buộc thay đổi. Tiếp tục phần việc an toàn, khoanh đúng điểm chưa rõ và nêu phương án nhỏ nhất. Không tự mở rộng quyền ghi, xóa test hoặc sửa Flyway history để vượt vướng mắc.

Kết thúc nhiệm vụ, báo: phạm vi đã sửa, file/ràng buộc thay đổi, hành vi được bảo toàn, test thực sự chạy và kết quả, API/bridge/exception còn lại, rủi ro chưa kiểm chứng và điểm rollback. Nếu chỉ sửa tài liệu, nói rõ chưa sửa/chạy backend; không trình bày mẫu Java như implementation hoàn tất.
