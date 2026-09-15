# Backend Ladux — Quy tắc phụ thuộc

## 1. Quy tắc nền tảng

Dependency trong tài liệu này là tham chiếu Java lúc biên dịch: import, kiểu field/method/generic, inheritance, annotation hoặc lời gọi. Nó khác với hướng sự kiện chạy lúc runtime.

- Module khác chỉ được tham chiếu `org.akira.ladux.<module>.api..` nếu được ma trận cho phép.
- `api` không tham chiếu nội bộ chính module, module khác hoặc kiểu framework/SDK không được duyệt.
- `domain` không tham chiếu application, infrastructure hoặc module khác. Cho phép JPA annotation có chọn lọc, không cho association entity chéo module.
- `application` có thể dùng domain, API nội bộ, output port và API module được phép; không phụ thuộc infrastructure.
- `infrastructure` triển khai port, gọi application/API và ánh xạ domain nội bộ khi cần. Controller không truy cập persistence/domain trực tiếp.
- `shared` không phụ thuộc nghiệp vụ hoặc workflow. Module nghiệp vụ không phụ thuộc workflow.

<a id="2-ma-tran-phu-thuoc"></a>
## 2. Ma trận phụ thuộc

Đây là nguồn duy nhất cho danh sách dependency chéo module. Mỗi dòng là **module sử dụng → API module được phép dùng**, không phải nghĩa vụ phải tạo đủ dependency.

Global rule:
All modules may depend on shared.api.
No module may depend on shared.infrastructure.

| Module sử dụng | API module được phép |
| --- | --- |
| `identity` | Không có module nghiệp vụ khác |
| `customer` | `identity.api` |
| `catalog` | `identity.api` |
| `inventory` | `catalog.api` |
| `promotion` | `customer.api` |
| `ordering` | `catalog.api`, `inventory.api`, `promotion.api`, `identity.api`, `customer.api` |
| `procurement` | `catalog.api`, `inventory.api`, `identity.api` |
| `payment` | `ordering.api`, `identity.api` |
| `notification` | `identity.api`, `ordering.api`, `payment.api`|
| `assistant` | `catalog.api`|
| `workflow` | API của chín module nghiệp vụ khi luồng cụ thể cần |
| `shared` | Không có module ứng dụng nào |

Các module được dùng primitive công khai ở `shared.api`; `shared.infrastructure` là nội bộ và không được module khác import; không dùng shared làm đường vòng tới nghiệp vụ. Không thêm `catalog → inventory`, `ordering → payment`, `identity → ordering` hay chiều ngược từ nghiệp vụ về workflow. Nếu cần, dùng workflow hoặc thay đổi ranh giới bằng ADR và kiểm tra lại toàn đồ thị.

Chỉ application/infrastructure được gọi API module khác. Domain và exported API không được kéo dependency chéo module dù dòng ma trận có cho phép. Điều này tránh một contract trung gian vô tình xuất toàn bộ graph kiểu dữ liệu.

## 3. Contract API và dữ liệu

Export interface/record/value type có tên theo nghiệp vụ; không export entity, repository, persistence context, Spring Data `Page`, servlet, security principal framework hoặc kiểu SDK VNPay. Pagination dùng DTO trung lập. API dùng kiểu của chính `api`, primitive ở `shared.api` hoặc JDK; annotation validation có thể được cho phép tường minh.

Kiểm tra cả generic, superclass, annotation và DTO lồng nhau: `List<Product>` vẫn là entity leak. DTO của API A không được chứa `B.api.SomeDto`; A ánh xạ về snapshot của A khi cần xuất dữ liệu. Không đưa DTO REST vào API Java để tiết kiệm một lớp mapping nếu làm contract phụ thuộc web.

Contract nên chỉ rõ actor, tiền/currency, đơn vị quantity, operation ID, expected version khi cần, lỗi nghiệp vụ và semantics khi gọi lặp. Internal API vẫn phải kiểm tra dữ liệu và quyền cần thiết; validation chỉ ở controller không đủ.

ID chéo module là giá trị/scalar. Foreign key DB có thể giữ để bảo toàn tính toàn vẹn nhưng không phải quyền import entity hoặc repository. Dùng batch API/projection để tránh N+1 khi bỏ JPA association; giới hạn kích thước batch và kết quả theo nhu cầu.

## 4. Controller và application

Controller xử lý HTTP binding, validation đầu vào, lấy actor và ánh xạ response; gọi application service cùng module. Controller của luồng phối hợp thuộc workflow và gọi workflow application. Không gọi repository/EntityManager/JDBC trực tiếp hoặc đi tắt vào domain để đổi trạng thái.

Application đặt transaction, kiểm tra quyền nghiệp vụ và gọi port. Không tạo hai interface chỉ để bọc một method đơn giản. `OrderQueries` có thể gom các truy vấn liên quan; command phức tạp nên tách theo invariant/transaction. Khi controller trực tiếp dùng application class ở package khác, class đó phải public.

## 5. Persistence và transaction

Repository adapter thuộc module sở hữu dữ liệu. Port mà application cần thuộc application; Spring Data repository nội bộ thuộc infrastructure. Không tự thêm một repository port cho mọi bảng khi use case không cần abstraction đó.

Các bước cần nguyên tử phải cùng physical transaction và DB. Không dùng `@Async`, event hậu commit hoặc `REQUIRES_NEW` để gọi reserve/release, redeem/rollback trong transaction cốt lõi. Giữ isolation/lock/rollback thật của baseline và kiểm thử rollback từ module cuối quay về các module trước. [Spring transaction propagation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html).

Không dùng transaction annotation để hứa nguyên tử với Redis hoặc HTTP. Payment/refund remote dùng persisted intent và đối soát; xem [Payment](02-module-boundaries.md#6-payment). Ngoại lệ Inventory ghi cột stock trên bảng biến thể phải tuân thủ đầy đủ [quy tắc writer](02-module-boundaries.md#4-inventory-va-cot-stock-dung-chung), không cho nhập repository Catalog.

Không chỉnh migration Flyway đã áp dụng; thêm versioned migration mới, tương thích rollout/rollback đã xác định. Refactor package mặc định không cần đổi schema. Nếu cần schema cho durability/idempotency, đó là thay đổi có chủ đích với kế hoạch triển khai riêng trong cùng chương trình di chuyển. [Flyway versioned migrations](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations).

## 6. Event: hướng import và độ bền

Event do publisher sở hữu, đặt trong `<publisher>.api.event`. Consumer import kiểu đó nên dependency Java đi **consumer → publisher.api**. Ví dụ `notification → ordering.api`, dù lúc chạy OrderPlaced đi từ Ordering tới Notification. Đổi direct call thành listener không tự loại bỏ cycle.

Event có event ID, aggregate ID/version hoặc khóa thứ tự phù hợp, occurredAt, schema version khi cần và payload snapshot tối thiểu; không chứa entity, lazy proxy hoặc dữ liệu nhạy cảm không cần thiết.

| Nhu cầu | Cơ chế |
| --- | --- |
| Lỗi phải rollback nghiệp vụ đang chạy | API đồng bộ trong cùng transaction |
| Hiệu ứng sau commit, được phép mất có chủ đích | Listener in-process; ghi rõ chính sách và theo dõi lỗi |
| Hiệu ứng sau commit, không được mất | Outbox/publication registry bền, lưu cùng transaction gốc, worker/retry và consumer lũy đẳng |

`AFTER_COMMIT` không tự cung cấp async, retry hoặc durability. Khi listener ghi DB sau commit, phải có transaction mới hoặc worker transaction riêng. Chọn Spring Modulith registry chỉ sau khi xác minh phiên bản Spring Boot/Modulith và cơ chế retry tương thích; không bắt buộc thêm broker hoặc microservice. [Spring events](https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html), [Modulith events](https://docs.spring.io/spring-modulith/reference/events.html).

Consumer phải chịu được duplicate, out-of-order và crash. Dedup với unique constraint cùng transaction áp dụng hiệu ứng; thất bại transaction không được giữ dấu “đã xử lý”. Có retry/backoff, giới hạn, trạng thái lỗi, replay có kiểm soát và theo dõi backlog/tuổi event. Không cam kết exactly-once đối với provider không hỗ trợ.

## 7. Ngoại lệ trong giai đoạn chuyển tiếp

Giữ một registry ngoại lệ trong repository hoặc sử dụng baseline có kiểm soát. Mỗi ngoại lệ ghi source class/member, target class/member hoặc cột SQL cụ thể, lý do, owner, mốc hết hạn/điều kiện gỡ và kiểm thử bảo vệ. Không dùng wildcard cho cả module, không tự bổ sung ngoại lệ khi CI đỏ.

Code mới và phần đã di chuyển không thêm vi phạm. Legacy caller phải qua API của module đã đóng; không coi “chưa migrate” là quyền truy cập internals mãi mãi. Nếu chưa gỡ được association/SQL cũ, ghi trạng thái module là đang chuyển tiếp và giữ exception cụ thể; chưa đánh dấu hoàn thành.

Bật kiểm tra cycle từ đầu trên graph thực tế, đóng băng vi phạm hiện hữu nếu cần; không chờ hardening mới kiểm tra. ArchUnit kiểm tra bytecode, không phát hiện đầy đủ SQL/reflection/configuration; bổ sung review và integration test. Xem [các gate](05-archunit-rules.md).

## 8. Spring Modulith là lựa chọn bổ sung

ArchUnit là gate kiến trúc cơ sở của kế hoạch này. Nếu dùng thêm Spring Modulith, cấu hình rõ API subpackage như named interface; không giả định mọi `*.api` được export theo convention mặc định của Modulith. Verification cần kiểm tra cycle, truy cập nội bộ và allowed dependencies theo cấu hình thực tế. Không thêm framework thứ hai chỉ để lặp lại gate đã đủ. [Modulith fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html), [verification](https://docs.spring.io/spring-modulith/reference/verification.html).
