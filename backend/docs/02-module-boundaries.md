# Backend Ladux — Ranh giới module

## 1. Nguyên tắc sở hữu

Mỗi invariant và thao tác ghi có một chủ sở hữu. Vị trí cột vật lý không tự quyết định quyền sở hữu logic. Không đọc/ghi repository, entity hay SQL của module khác; ngoại lệ chuyển tiếp duy nhất được định nghĩa cụ thể cho tồn kho bên dưới và phải có thời hạn/điều kiện kết thúc.

Đây là đặc tả mục tiêu. Tên entity phản ánh tài liệu đầu vào, cần đối chiếu tên và hành vi thật trong repository trước khi sửa source.

## 2. Identity

Sở hữu `User`, `Role`, `Customer`, `UserAddress`, `RefreshToken`, `EmailVerification`, `PhoneVerification`, `UserMfaMethod`, `LoginHistory`, `SecurityEvent`, authentication và principal nội bộ.

Use case: đăng ký/đăng nhập, JWT, refresh rotation/revocation, đổi/quên mật khẩu, OAuth2, MFA, OTP, hồ sơ/địa chỉ, lịch sử và sự kiện bảo mật. Email/SMS phục vụ OTP và xác minh bảo mật có thể tiếp tục ở Identity qua output port; không buộc đi qua Notification.

API chỉ trả snapshot danh tính, địa chỉ hoặc quyền tối thiểu. Không xuất `User`, Hibernate proxy hay `UserPrincipal` gắn framework. Ordering lưu shipping snapshot tại lúc đặt hàng; không giữ association tới `UserAddress`.

Nếu điểm khách hàng đang nằm trong `Customer`, Identity tiếp tục sở hữu số dư và invariant cho tới ADR khác. Workflow có thể tiếp nhận event của Ordering rồi gọi Identity API với event ID và tham chiếu đơn; Identity chống áp dụng trùng, xử lý bù đúng và không import Ordering. Nếu điểm có giá trị quy đổi, cần ledger và giao nhận event bền. Không để listener trong Identity import Ordering event rồi tạo cycle qua các module khác.

## 3. Catalog

Sở hữu `Product`, danh tính/cấu hình `ProductVariant`, `ProductImage`, `Brand`, `Category`, `Color`, `Review`, `Wishlist`; quản lý thông tin sản phẩm, giá hiển thị, tìm kiếm, hình ảnh và nội dung đánh giá.

API cung cấp projection/snapshot theo ID và truy vấn batch. Giá cuối cùng của đơn phải được Ordering chốt cùng Promotion theo quy tắc tại checkout; không tin giá từ client. Review cần chứng minh đã mua được phối hợp qua workflow; Catalog không gọi Ordering. Endpoint đọc sản phẩm kèm stock được workflow ghép dữ liệu Catalog và Inventory, giữ nguyên URL/JSON nếu cần.

Catalog không được ghi tồn kho bằng entity save, mapper, native query, import CSV, job hoặc endpoint quản trị. Quy tắc này bao gồm thao tác tạo/cập nhật biến thể có quantity đầu vào: phần quantity phải chuyển tới Inventory theo đơn vị transaction phù hợp.

<a id="4-inventory-va-cot-stock-dung-chung"></a>
## 4. Inventory và cột stock dùng chung

Inventory sở hữu `StockMovement`, loại/tham chiếu biến động, reservation, release, receiving, adjustment và availability. API gợi ý: `reserveForOrder`, `releaseForOrder`, `receivePurchase`, `adjustStock`, `getAvailability` và bản batch.

### 4.1 Một nơi duy nhất được ghi

Trong giai đoạn giữ cột `ProductVariant.stockQuantity` trên bảng biến thể:

1. Catalog tiếp tục sở hữu danh tính và cấu hình biến thể; **Inventory là writer duy nhất của stock**.
2. Inventory có adapter persistence riêng thực hiện cập nhật có điều kiện/khóa và ledger. Adapter dùng SQL hoặc mapping nội bộ của Inventory; không import `CatalogRepository` hay entity Catalog.
3. Mapping Catalog cho stock phải không sinh UPDATE (`updatable = false`), bỏ setter và loại stock khỏi mapper/update/import. Bỏ setter riêng lẻ không đủ bảo vệ khi entity vẫn dirty hoặc có native query.
4. `insertable = false` chỉ dùng khi schema/default đã bảo đảm giá trị khởi tạo hợp lệ. Nếu cần, thêm migration mới đặt default ban đầu và kiểm tra dữ liệu hiện hữu. Số lượng ban đầu khác 0 phải qua Inventory và ledger trong cùng transaction; không âm thầm mất hành vi nhập stock khi tạo sản phẩm.
5. Khi bulk/native update, quy định đọc lại/refresh có chủ đích và vô hiệu hóa cache sau commit. Không tin entity Catalog đã load trước cập nhật; không gọi `EntityManager.clear()` tùy tiện làm mất thay đổi chưa flush.
6. Kiểm kê mọi writer bằng tìm repository/native SQL/job/import và kiểm thử hồi quy. ArchUnit không chứng minh được SQL không sửa cột trái quyền.

`updatable` điều khiển SQL do mapping sinh; bulk update không tự đồng bộ persistence context hoặc kiểm tra optimistic version. Nếu dùng `@Version`, adapter phải quản lý version/check conflict đúng, không giả định native update đã bảo vệ. [Jakarta Persistence: bulk update và column mapping](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2).

Ngoại lệ vật lý chỉ cho phép Inventory truy cập các cột khóa/stock/version cần thiết của bảng biến thể đã được ghi nhận trong baseline. Không mở quyền sửa giá, SKU hay thuộc tính Catalog. Khi tách bảng stock về Inventory trong một thay đổi schema riêng, phải backfill, đối chiếu và chuyển writer có kiểm soát; không bật hai writer song song.

### 4.2 Bất biến tồn kho

- Chốt ý nghĩa quantity hiện tại trước khi sửa: tồn vật lý hay lượng khả dụng. Nếu reserve đã trừ lượng khả dụng, confirm không được trừ lần nữa. Không tự thêm mô hình reservation mới làm thay đổi semantics trong refactor package.
- Reserve chỉ thành công khi đủ số lượng; không âm kho nếu chính sách hiện hành không cho phép. Kiểm tra và ghi phải nguyên tử dưới concurrency.
- Biến động stock và ledger cùng commit/rollback; ledger ghi actor, lý do, loại, tham chiếu nghiệp vụ, operation ID và số lượng trước/sau hoặc dữ liệu tương đương đủ đối soát.
- Release tham chiếu reservation đã có, không giải phóng quá lượng đã giữ và chưa giải phóng; không tăng stock hai lần vì cancel/expire/retry trùng.
- Mọi operation ID có scope, unique constraint và dữ liệu định danh request rõ. Cùng ID với payload khác phải báo conflict, không coi là lần gọi trùng hợp lệ.
- Khóa nhiều variant theo thứ tự ổn định; giữ cùng thứ tự giữa các luồng.

## 5. Ordering

Sở hữu `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderHistory`, `ShippingAddress` dạng snapshot và `OrderStatus`. Quản lý tạo đơn, giỏ hàng, query, state machine, cancel và return.

Ordering gọi Catalog/Inventory/Promotion/Identity qua API được phép; không gọi Payment. Nó cung cấp API cần thiết để Payment đọc số tiền/currency/trạng thái thanh toán được phép và áp dụng payment outcome lũy đẳng. Không có API “set status” tổng quát bỏ qua state machine. API áp dụng payment outcome phân biệt đã áp dụng, trùng và order đã ở trạng thái không tiếp nhận; trường hợp đến muộn dự kiến là kết quả nghiệp vụ để Payment ghi fact/intent, không ném lỗi làm transaction bắt buộc rollback toàn bộ. Lỗi integrity hoặc kỹ thuật thực sự vẫn phải rollback.

Chốt price, discount, tax/phí nếu hiện có, địa chỉ và item snapshot ở server. Mọi transition kiểm tra trạng thái hiện tại, quyền actor và version/lock. Phân biệt hủy đơn, yêu cầu hoàn tiền và đã hoàn tiền; không đánh dấu refunded chỉ vì đã gửi yêu cầu.

Checkout cần order và local payment attempt nguyên tử được workflow gọi vào hai API. Cancel cần đồng thời ghi refund intent cũng dùng workflow; Ordering vẫn quyết định có được hủy, release stock và rollback coupon hay không. Đơn vị phối hợp không chuyển ownership của các invariant sang workflow.

## 6. Payment

Sở hữu `Payment`, attempt, merchant reference, provider result, IPN/webhook, refund intent và trạng thái đối soát. Gateway cụ thể nằm trong `payment.infrastructure.integration`, sau port do Payment định nghĩa. Payment chỉ phụ thuộc API Ordering và Identity khi cần; không truy cập `OrderRepository`.

### 6.1 Thanh toán và callback

- Dùng định danh attempt/merchant reference unique trong DB; idempotency key có scope, payload fingerprint và quy tắc trả lại kết quả cũ. Không chỉ dựa vào Redis hoặc kiểm tra “exists” rồi insert.
- Xác minh chữ ký bằng dữ liệu/canonicalization theo provider; đối chiếu reference, amount, currency và trạng thái hợp lệ. Khóa hoặc update có điều kiện để callback trùng/đến đồng thời không tạo hiệu ứng lần hai.
- Return URL phục vụ điều hướng/hiển thị; IPN hoặc kết quả đối soát được xác minh mới là nguồn cập nhật theo hợp đồng gateway. [VNPay PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).
- IPN thành công đến sau cancel/expire vẫn là sự thật tiền đã nhận cần ghi nhận. Không tự mở lại đơn hoặc reserve lại stock. Persist kết quả và intent đối soát/hoàn tiền theo chính sách, rồi trả phản hồi protocol phù hợp khi đã ghi bền; không lặp lỗi vô hạn chỉ vì order không còn nhận transition bình thường.
- Cancel, expire và IPN tranh chấp phải có thứ tự khóa/state transition nhất quán. Có bảng quyết định cho success, failure, duplicate, out-of-order, late và amount mismatch.

### 6.2 Hoàn tiền

Tạo refund intent trong transaction DB trước khi gọi provider. Intent gồm operation ID duy nhất, payment reference, số tiền/currency, lý do, trạng thái, attempt/retry metadata và correlation ID. Tổng số đã hoàn cộng số đang giữ cho refund chưa kết thúc không được vượt số tiền được phép hoàn; kiểm tra này cần lock hoặc update có điều kiện.

Worker gọi HTTP ngoài transaction giữ khóa nghiệp vụ. Timeout/mất kết nối có thể là **chưa rõ kết quả**, không đồng nghĩa thất bại. Lưu trạng thái `UNKNOWN` hoặc tương đương, đối soát khả năng provider thực sự hỗ trợ; chỉ retry khi biết an toàn, dùng lại định danh logic theo hợp đồng provider. Nếu không xác định được, đưa vào xử lý vận hành thay vì tạo request mới mù quáng.

Tên trạng thái cụ thể phải ánh xạ vào model hiện có; tối thiểu phân biệt pending/in-flight, succeeded, failed xác định và unknown. Crash giữa provider success và DB update phải được phục hồi bằng đối soát/lũy đẳng. Unique request ID của provider không tự chứng minh provider sẽ trả cùng kết quả khi gửi lại. [VNPay query/refund](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html).

## 7. Procurement

Sở hữu `Supplier`, `ProductSupplier`, `PurchaseOrder`, `PurchaseOrderItem`, trạng thái và lượng đã nhận. Gọi Inventory API để tăng stock, Catalog API để xác minh biến thể và Identity API khi cần.

Nhập từng phần phải có định danh **lần nhận/receipt** riêng; PO ID + variant ID không đủ vì cùng PO được nhận nhiều lần. Một request nhận hàng cần receipt ID ổn định, item/variant, quantity và actor. Procurement kiểm tra lượng được phép nhận và cập nhật received quantity; Inventory chống biến động trùng và ghi ledger, cùng transaction.

Đề xuất unique `(receiptId, purchaseOrderItemId)` tại Procurement và khóa operation phù hợp tại Inventory, ví dụ `(operationId, variantId, movementKind)` sau khi tổng hợp item trùng. Ràng buộc chính xác phải khớp model thật. Cùng receipt với nội dung khác là conflict. Receipt khác phải được kiểm tra tránh nhận quá số lượng, kể cả khi chạy đồng thời.

## 8. Promotion

Sở hữu `Coupon`, `DiscountType`, thời hạn, hạn mức, redemption và rollback. Tách quote khỏi redeem: quote không đảm bảo còn quota khi commit. Redeem xác minh lại điều kiện và trừ quota nguyên tử; rollback tham chiếu redemption đã có và lũy đẳng.

API nhận dữ liệu đủ tính toán từ Ordering như customer ID, item/amount snapshot và operation ID; không gọi ngược Ordering hoặc truy cập order entity. Không lấy subtotal/discount từ client làm nguồn tin. Không thay đổi thứ tự tính giảm giá hoặc làm tròn trong refactor.

## 9. Notification

Sở hữu `Notification`, `NotificationType`, inbox/thông báo nghiệp vụ và adapter gửi chung. Nó có thể import event/API từ các publisher theo ma trận, và Identity API để lấy thông tin liên hệ được phép. Publisher không import Notification để phát event.

Notification lỗi không rollback checkout. Nếu thông báo bắt buộc phải giao, dùng publication bền, retry có giới hạn/backoff, trạng thái lỗi và dedup `(eventId, recipient, channel)` phù hợp. Nếu email provider không có idempotency, phải chấp nhận/giảm thiểu khả năng gửi trùng và ghi rõ chính sách; không hứa exactly-once end-to-end.

## 10. Shared và Workflow

`shared` chỉ chứa lỗi nền tảng, pagination trung lập, clock/time, ID/correlation/actor primitive hoặc cấu hình kỹ thuật chung thực sự. Không có `User`, `Product`, `Order`, repository nghiệp vụ, service tổng hợp hoặc DTO chứa entity. Primitive công khai đặt ở `shared.api`, không tham chiếu framework/SDK hoặc shared internals; cấu hình/adapter chung ở `shared.infrastructure`. Module khác chỉ import shared API, không đi tắt qua shared infrastructure. Shared không import module nghiệp vụ hay workflow.

`workflow` chỉ điều phối qua API. Không tạo domain entity, repository hoặc schema nghiệp vụ riêng trong workflow. Worker/event infrastructure dùng cơ chế publication đã chọn; state thuộc Order, Payment, Identity… phải được ghi qua module chủ sở hữu. Nếu cần process state lâu dài riêng, bổ sung ADR xác định owner trước khi mở rộng vai trò workflow.

API có thể được phép về chiều import nhưng vẫn phải tuân thủ quyền dữ liệu. Contract “internal” không miễn xác thực/ủy quyền và kiểm tra invariant.
