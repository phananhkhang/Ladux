# Backend Ladux — Kế hoạch di chuyển

## 1. Chiến lược

Di chuyển tăng dần qua API seam, không viết lại toàn bộ backend. Một nhiệm vụ tập trung một lát cắt nghiệp vụ có thể kiểm chứng; việc thêm vài API/adapter ở module liên quan được phép khi cần khép kín lát cắt đó. Không ép “một module tuyệt đối mỗi PR” nếu làm transaction bị chia đôi.

Đây là kế hoạch, không phải bảng tiến độ đã thực hiện. Mọi trạng thái hoàn thành phải kèm bằng chứng từ repository và CI. Không gộp đổi framework, thiết kế lại bảo mật hoặc thêm tính năng vào refactor package.

## 2. Foundation trước khi di chuyển

1. Đọc [AGENT.md](../../AGENT.md) và các tài liệu có thẩm quyền trong [README](README.md).
2. Ghi baseline từ source: dependency graph, callers/callees, entity association, REST contract, SQL writer, transaction/lock, cache, scheduler, external adapter và test hiện có.
3. Lập bảng transaction cho checkout, cancel, expire, nhận hàng, IPN và refund. Xác định checkout hiện có bao gồm local payment attempt hay không; không suy ra chỉ từ tên method.
4. Ghi các invariant cần bảo toàn: ownership/IDOR, khóa giỏ, giá và địa chỉ snapshot, stock/ledger, coupon, dọn giỏ, order history, terminal state, idempotency và bảo mật.
5. Thêm ArchUnit và kiểm tra cycle ngay. Tạo baseline vi phạm hiện hữu có review, owner và điều kiện gỡ; CI không được tự tạo hoặc nới baseline.
6. Xác định event/side effect nào được phép mất; nếu không được mất, chọn outbox hoặc publication registry bền, với schema/triển khai tương thích trước khi chuyển luồng sang bất đồng bộ.
7. Xác nhận phiên bản Java/Spring Boot/JPA/ArchUnit và plugin Surefire/Failsafe từ `pom.xml`, không tự nâng theo tài liệu mẫu.

Kết quả Foundation: bản đồ ownership/transaction, danh sách ngoại lệ chính xác, test baseline chạy được, tiêu chí pilot và kế hoạch rollback. Chưa gọi module nào là đã đóng nếu còn truy cập internals ngoài ranh giới.

## 3. Thứ tự khuyến nghị và tiêu chí ra khỏi giai đoạn

| Giai đoạn | Phạm vi chính | Điều kiện hoàn tất |
| --- | --- | --- |
| A. Pilot Catalog | Brand/Category/Color hoặc truy vấn sản phẩm ít liên kết; tạo Catalog API cần thiết | REST giữ nguyên, controller qua application, không thêm entity/repository leak |
| B. Seam dữ liệu dùng chung | Thay liên kết chéo entity bằng ID/snapshot; chuẩn bị read-only stock mapping và Inventory API | Có danh sách writer, transaction baseline, ngoại lệ legacy cụ thể; chưa tuyên bố toàn Catalog hoàn tất |
| C. Promotion | Quote/redeem/rollback và quota | Kiểm thử đồng thời, retry/rollback, giá và làm tròn đúng baseline |
| D. Inventory | Writer duy nhất, ledger, reserve/release/receive/adjust | Không còn writer stock trái quyền; concurrency/idempotency và cache được kiểm chứng |
| E. Procurement | Supplier/PO/partial receiving | Receipt ID/dedup, chống over-receive, PO và stock/ledger cùng rollback |
| F. Ordering + workflow cần thiết | Cart/order/cancel/expire; điều phối checkout | Bảo toàn đơn vị nguyên tử, state machine, snapshot, dọn giỏ và IDOR |
| G. Payment | Attempt, VNPay adapter, IPN, refund intent/worker | Callback trùng/late/race, amount/signature, timeout/crash/đối soát đều có test |
| H. Identity | Auth/profile và adapter bảo mật | JWT/refresh/MFA/OTP/OAuth2/rate limit/TTL không hồi quy |
| I. Notification | Consumer và gửi thông báo | Sau commit, độ bền theo yêu cầu, dedup/retry/replay và lỗi provider được kiểm chứng |
| J. Khép ranh giới và hardening | Gỡ bridge/exception còn lại, quan sát vận hành | Gate nghiêm ngặt toàn module, không còn cycle, API leak hoặc writer trái quyền |

Thứ tự có thể điều chỉnh theo dependency thực tế. Identity API tối thiểu có thể được tạo sớm dù di chuyển đầy đủ Identity ở giai đoạn H. Payment API tối thiểu phải có trước khi workflow checkout sử dụng; implementation có thể là bridge tạm vào legacy với ngoại lệ đã ghi nhận, sau đó gỡ ở G.

Catalog pilot không đồng nghĩa toàn Catalog đã migrate. Chỉ đóng Catalog sau khi gỡ hết liên kết entity/repository ngoại lai và hoàn thành kiểm soát stock, kể cả các caller còn ở package legacy. Không giữ một “CatalogRepository bridge” cho Inventory rồi đánh dấu cả hai đã hoàn thành.

## 4. Quy trình một lát cắt

### Trước thay đổi

- Chọn use case/endpoint cụ thể và ghi hành vi quan sát được, kể cả lỗi và phân quyền.
- Tìm toàn bộ caller qua import, reflection/string configuration, query/SQL, entity relation, scheduler và cache.
- Kiểm tra transaction annotation có hiệu lực qua proxy, thứ tự lock, unique constraint và loại exception.
- Chạy test liên quan; phân biệt baseline đang lỗi với lỗi do thay đổi mới.

### Tạo API seam

- Thiết kế contract tối thiểu bằng ID/snapshot; không trả entity và không expose SDK.
- Di chuyển business implementation về chủ sở hữu, để caller dùng API. Nếu cần bridge vào legacy, định danh class/edge cụ thể, owner và điều kiện gỡ.
- Đổi JPA association chéo module có kiểm soát, giữ FK khi phù hợp; thêm batch query để tránh N+1.
- Với stock, hoàn tất cả mapping, native SQL, importer và scheduler writer; tìm một setter không đủ.

### Di chuyển và khép kín

- Chuyển controller/adapter/use case từng nhóm; không để cả bean mới và cũ được scan và xử lý cùng endpoint/job.
- Cập nhật package scan, entity/repository scan, bean name, qualifier, SpEL, AOP pointcut, Jackson type metadata và cache serializer có chứa tên class nếu có.
- Giữ lock name/ShedLock, cron, TTL và key, trừ khi có kế hoạch rollout tương thích đã ghi rõ.
- Thêm rule kiến trúc và test hành vi cho rủi ro thay đổi thực tế; gỡ ngoại lệ được giải quyết trong cùng thay đổi.

<a id="5-ma-tran-kiem-chung-trong-yeu"></a>
## 5. Ma trận kiểm chứng trọng yếu

| Luồng | Tình huống phải kiểm chứng | Bất biến cần thấy |
| --- | --- | --- |
| Checkout | Hết hàng, coupon hết quota, lỗi tạo payment attempt sau bước trước | Không có order/stock/coupon/attempt commit một phần; giỏ và lịch sử đúng semantics |
| Checkout đồng thời | Cùng giỏ/idempotency key, hai đơn tranh stock cuối | Không tạo đơn hoặc trừ stock hai lần; không âm kho |
| Cancel/expire | Lặp request, đồng thời với IPN và worker | Transition hợp lệ; release/coupon rollback đúng một lần về mặt hiệu ứng |
| Inventory | Native update rồi Catalog save/read, reserve rồi confirm, release quá lượng | Không ghi đè stock; không trừ hoặc hoàn hai lần; ledger khớp |
| Procurement | Hai lần nhận hợp lệ cùng PO, retry một receipt, payload đổi, nhận đồng thời quá PO | Hai receipt hợp lệ được ghi riêng; retry không tăng stock lần hai; không vượt lượng được nhận |
| Payment | Sai chữ ký/amount, callback trùng/đảo thứ tự/đến muộn | Không ghi nhận sai tiền; payment fact được giữ và ngoại lệ được xử lý bền |
| Refund | Timeout, crash sau provider success, hai partial refund đồng thời | Không hoàn quá tiền; kết quả unknown được đối soát; retry không tạo refund mới mù quáng |
| Event | Kill process sau commit trước listener, consumer crash, duplicate/replay | Không mất sự kiện bắt buộc; dedup và khôi phục được |
| Identity | Refresh rotation/reuse/revocation, MFA/OTP expiry, IDOR | Giữ quyền, TTL và semantics bảo mật |
| Cache/job | Hai phiên bản chạy đồng thời, key/serializer cũ, job vượt thời gian khóa | Không đọc sai quyền, không hỏng dữ liệu cache, job vẫn lũy đẳng |

Chọn test theo phần bị thay đổi; không bắt mọi PR chạy lại tất cả kịch bản không liên quan. Test đồng thời và transaction phải dùng PostgreSQL thực/Testcontainers phù hợp; mock repository không chứng minh được lock, unique constraint hay atomic rollback.

## 6. CI và bằng chứng nghiệm thu

Trong phát triển có thể chạy test mục tiêu như `./mvnw -Dtest=ArchitectureRulesTest test`. Gate hợp nhất là `./mvnw verify` với profile môi trường của repository. Không cần lặp compile/test/verify nhiều lần khi không có rủi ro mới.

`verify` chỉ chứng minh integration test nếu Failsafe được bind đúng `integration-test` và `verify`, tên test khớp includes và không bị skip. Lưu Surefire/Failsafe reports, xác nhận test thực sự chạy và hạ tầng Testcontainers sẵn sàng. [Maven Failsafe usage](https://maven.apache.org/surefire/maven-failsafe-plugin/usage.html).

CI phải thất bại khi import kiến trúc rỗng, test yêu cầu không được khám phá, baseline bị nới trái phép hoặc integration test cần thiết bị skip. Không vô hiệu hóa rule/test để làm xanh pipeline. Workflow CI giữ phiên bản Java/action/dependency đã được repository kiểm chứng; không dùng bản “latest” chưa xác nhận trong refactor.

## 7. Rollout và rollback

- Chia commit theo seam, migration và cleanup để có điểm revert rõ. Không triển khai đồng thời hai implementation ghi cùng dữ liệu hoặc chạy cùng job ngoài thiết kế có kiểm soát.
- Refactor package không đổi schema thường có thể revert code; vẫn phải rà cache/serializer, bean name và job trong rolling deployment.
- Với schema mới cho operation ID/outbox/refund, dùng expand → backfill/đối chiếu → chuyển đọc/ghi → contract ở thay đổi sau. Không giả định bản cũ hiểu được payload/status mới.
- Không sửa hoặc rollback phá hủy migration Flyway đã áp dụng. Chọn roll-forward khi DB đã nhận dữ liệu không tương thích với bản cũ; ghi rõ điểm không thể revert code an toàn.
- Quan sát stock mismatch, order/payment lệch trạng thái, refund unknown, event backlog và lỗi xác thực sau rollout. Đặt ngưỡng vận hành theo baseline thật, không tự bịa SLO hoặc tải đã chịu được.

## 8. Định nghĩa hoàn thành

Một module hoàn tất khi ownership/API rõ, caller ngoài chỉ dùng API được phép, không còn association/repository/SQL trái quyền, không lộ entity, không tạo cycle, controller qua application, transaction/lock/idempotency/API được bảo toàn, và test bắt buộc đã chạy thành công.

Cache, scheduler, security và external I/O liên quan đã được rà soát; tài liệu/CI đã cập nhật; bridge và ngoại lệ cho ranh giới module đó đã được gỡ. Ngoại lệ stock vật lý được cho phép bởi quyết định kiến trúc phải được kiểm chứng riêng, không bị hiểu là quyền truy cập chung vào bảng Catalog.

Nếu còn exception tạm thời chưa gỡ, trạng thái là **đang chuyển tiếp**, kể cả khi build xanh. Không dùng “đã migrate” chỉ để nói đã đổi package.

## 9. Mẫu giao việc

**Phân tích:** “Đọc `backend/AGENT.md` và tài liệu kiến trúc. Lập dependency/transaction map cho [use case], liệt kê writer, lock, idempotency, REST/security, cache/job và test. Đề xuất seam cùng ngoại lệ chính xác, tiêu chí nghiệm thu và rollback. Chưa sửa hành vi.”

**Thực hiện:** “Di chuyển [lát cắt] theo baseline đã xác nhận. Giữ API và invariant, tạo API seam, thêm gate cho ranh giới mới, chạy test cần thiết, gỡ bridge đã thay thế. Báo cáo thay đổi, bằng chứng test, ngoại lệ còn lại và giới hạn chưa kiểm chứng.”
