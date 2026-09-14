# Backend Ladux — Ranh giới module

## 1. Nguyên tắc sở hữu

Mỗi invariant và thao tác ghi có một chủ sở hữu. Vị trí cột vật lý không tự quyết định quyền sở hữu logic. Không đọc/ghi repository, entity hay SQL của module khác; ngoại lệ chuyển tiếp duy nhất được định nghĩa cụ thể cho tồn kho bên dưới và phải có thời hạn/điều kiện kết thúc.

Đây là đặc tả mục tiêu. Tên entity phản ánh tài liệu đầu vào, cần đối chiếu tên và hành vi thật trong repository trước khi sửa source.

---

## 2. Identity

Identity trả lời câu hỏi: **người dùng là ai, đăng nhập bằng cách nào và có quyền gì?**

Sở hữu:

- `User`
- `Role`
- `RefreshToken`
- `EmailVerification`
- `PhoneVerification`
- `UserMfaMethod`
- `LoginHistory`
- `SecurityEvent`
- authentication
- authorization support
- principal nội bộ
- JWT
- refresh token rotation/revocation
- OAuth2
- MFA
- OTP phục vụ xác minh bảo mật
- password/password verification
- rate limiting và security event liên quan đăng nhập

Use case điển hình:

- đăng ký/đăng nhập
- refresh session
- logout/revoke session
- đổi/quên mật khẩu
- OAuth2 login
- MFA/TOTP
- email verification
- phone verification
- login history
- security event

Identity **không sở hữu** customer profile, loyalty points, customer level, total spent hoặc địa chỉ nghiệp vụ của khách hàng. Các trách nhiệm đó thuộc Customer.

API chỉ trả snapshot danh tính/quyền tối thiểu như account ID, trạng thái account, role/permission cần thiết hoặc thông tin xác thực được phép công khai cho module khác. Không export `User`, Hibernate proxy, Spring Security principal hoặc repository nội bộ.

Email/SMS phục vụ OTP và xác minh bảo mật có thể tiếp tục ở Identity qua output port; không bắt buộc đi qua Notification vì business owner của OTP là Identity.

Module khác cần account/security information phải gọi `identity.api`; không import entity/repository/application internal của Identity.

---

## 3. Customer

Customer trả lời câu hỏi: **khách hàng là ai về mặt nghiệp vụ và quan hệ với cửa hàng như thế nào?**

Sở hữu:

- `Customer`
- `UserAddress`
- customer profile
- customer level
- loyalty points
- total spent
- dữ liệu CRM/customer business state liên quan

Customer liên kết với account của Identity bằng ID/scalar hoặc contract qua `identity.api`; không import `User` entity, `UserRepository`, security principal hoặc infrastructure của Identity.

API có thể cung cấp:

- customer snapshot theo account/customer ID
- customer level
- loyalty information
- address snapshot/projection cần thiết
- operation cập nhật loyalty/total spent khi business flow yêu cầu

Không export `Customer` entity, `UserAddress` entity, Hibernate proxy hoặc repository.

Ordering phải lưu shipping address dưới dạng **snapshot tại thời điểm checkout**, không giữ JPA association trực tiếp tới `UserAddress`. Việc thay đổi địa chỉ sau này không được làm thay đổi đơn hàng lịch sử.

Loyalty/total spent được Customer sở hữu. Khi Ordering phát sinh sự kiện như `OrderDeliveredEvent`, Customer có thể xử lý thông qua listener/application boundary phù hợp. Consumer import event/API của publisher theo dependency rule; không cho Ordering truy cập `CustomerRepository`.

Nếu loyalty có giá trị quy đổi hoặc yêu cầu chống ghi trùng mạnh, operation/event phải có ID ổn định và cơ chế idempotency phù hợp. Nếu sự kiện không được phép mất, dùng publication bền theo chính sách event của kiến trúc.

---

## 4. Catalog

Catalog trả lời câu hỏi: **Ladux đang bán cái gì?**

Sở hữu:

- `Product`
- danh tính/cấu hình `ProductVariant`
- `ProductImage`
- `Brand`
- `Category`
- `Color`
- `Review`
- `Wishlist`
- thông tin sản phẩm
- giá hiển thị/current selling price policy
- tìm kiếm
- hình ảnh
- nội dung đánh giá

API cung cấp projection/snapshot theo ID và truy vấn batch. Không export entity/repository/persistence model.

Giá cuối cùng của đơn phải được Ordering chốt cùng Promotion theo quy tắc tại checkout; không tin giá từ client.

Review cần chứng minh đã mua được phối hợp qua workflow hoặc contract phù hợp; Catalog không gọi ngược Ordering nếu điều đó tạo dependency sai chiều.

Endpoint đọc sản phẩm kèm stock được workflow hoặc application composition ghép dữ liệu Catalog và Inventory, giữ nguyên URL/JSON nếu cần. Catalog không tự nhận ownership tồn kho chỉ vì stock đang nằm trên bảng `ProductVariant`.

Catalog không được ghi tồn kho bằng entity save, mapper, native query, import CSV, job hoặc endpoint quản trị. Quy tắc này bao gồm thao tác tạo/cập nhật variant có quantity đầu vào: phần quantity phải chuyển tới Inventory theo đơn vị transaction phù hợp.

---

<a id="5-inventory-va-cot-stock-dung-chung"></a>

## 5. Inventory và cột stock dùng chung

Inventory trả lời câu hỏi: **hệ thống thực sự có bao nhiêu hàng và hàng đang biến động như thế nào?**

Sở hữu:

- `StockMovement`
- loại/tham chiếu biến động
- stock availability
- reservation
- release
- receiving
- adjustment
- immutable/auditable stock ledger theo model thực tế

API gợi ý:

- `reserveForOrder`
- `releaseForOrder`
- `receivePurchase`
- `adjustStock`
- `getAvailability`
- batch availability/query khi cần

### 5.1 Một nơi duy nhất được ghi

Trong giai đoạn giữ cột `ProductVariant.stockQuantity` trên bảng biến thể:

1. Catalog tiếp tục sở hữu danh tính và cấu hình biến thể; **Inventory là writer duy nhất của stock**.
2. Inventory có adapter persistence riêng thực hiện cập nhật có điều kiện/khóa và ledger. Adapter dùng SQL hoặc mapping nội bộ của Inventory; không import `CatalogRepository` hay entity Catalog.
3. Mapping Catalog cho stock phải không sinh UPDATE (`updatable = false`), bỏ setter và loại stock khỏi mapper/update/import. Bỏ setter riêng lẻ không đủ bảo vệ khi entity vẫn dirty hoặc có native query.
4. `insertable = false` chỉ dùng khi schema/default đã bảo đảm giá trị khởi tạo hợp lệ. Nếu cần, thêm migration mới đặt default ban đầu và kiểm tra dữ liệu hiện hữu. Số lượng ban đầu khác 0 phải qua Inventory và ledger trong cùng transaction; không âm thầm mất hành vi nhập stock khi tạo sản phẩm.
5. Khi bulk/native update, quy định đọc lại/refresh có chủ đích và vô hiệu hóa cache sau commit. Không tin entity Catalog đã load trước cập nhật; không gọi `EntityManager.clear()` tùy tiện làm mất thay đổi chưa flush.
6. Kiểm kê mọi writer bằng tìm repository/native SQL/job/import và kiểm thử hồi quy. ArchUnit không chứng minh được SQL không sửa cột trái quyền.

`updatable` điều khiển SQL do mapping sinh; bulk update không tự đồng bộ persistence context hoặc kiểm tra optimistic version. Nếu dùng `@Version`, adapter phải quản lý version/check conflict đúng, không giả định native update đã bảo vệ.

Ngoại lệ vật lý chỉ cho phép Inventory truy cập các cột khóa/stock/version cần thiết của bảng biến thể đã được ghi nhận trong baseline. Không mở quyền sửa giá, SKU hay thuộc tính Catalog.

Khi tách bảng stock về Inventory trong một thay đổi schema riêng, phải backfill, đối chiếu và chuyển writer có kiểm soát; không bật hai writer song song.

### 5.2 Bất biến tồn kho

- Chốt ý nghĩa quantity hiện tại trước khi sửa: tồn vật lý hay lượng khả dụng. Nếu reserve đã trừ lượng khả dụng, confirm không được trừ lần nữa.
- Reserve chỉ thành công khi đủ số lượng; không âm kho nếu chính sách hiện hành không cho phép.
- Kiểm tra và ghi phải nguyên tử dưới concurrency.
- Biến động stock và ledger cùng commit/rollback.
- Ledger ghi actor, lý do, loại, tham chiếu nghiệp vụ, operation ID và số lượng trước/sau hoặc dữ liệu tương đương đủ đối soát.
- Release tham chiếu reservation đã có, không giải phóng quá lượng đã giữ và chưa giải phóng.
- Không tăng stock hai lần vì cancel/expire/retry trùng.
- Mọi operation ID có scope, unique constraint và dữ liệu định danh request rõ.
- Cùng ID với payload khác phải báo conflict, không coi là lần gọi trùng hợp lệ.
- Khóa nhiều variant theo thứ tự ổn định và giữ cùng thứ tự giữa các luồng.

---

## 6. Promotion

Promotion trả lời câu hỏi: **khuyến mãi/coupon được áp dụng như thế nào?**

Sở hữu:

- `Coupon`
- `DiscountType`
- thời hạn
- hạn mức/quota
- redemption
- rollback redemption

Tách quote khỏi redeem: quote không đảm bảo còn quota khi commit. Redeem xác minh lại điều kiện và trừ quota nguyên tử; rollback tham chiếu redemption đã có và phải lũy đẳng.

API nhận dữ liệu đủ tính toán từ Ordering như customer/account ID, item/amount snapshot và operation ID; không truy cập `Order` entity hoặc repository của Ordering.

Nếu promotion rule thực sự cần customer level/loyalty, lấy qua contract được phép của Customer thay vì import entity Customer.

Không lấy subtotal/discount từ client làm nguồn tin. Không thay đổi thứ tự tính giảm giá hoặc quy tắc làm tròn chỉ vì refactor package.

---

## 7. Procurement

Procurement trả lời câu hỏi: **Ladux lấy hàng từ đâu và nhập hàng như thế nào?**

Sở hữu:

- `Supplier`
- `ProductSupplier`
- `PurchaseOrder`
- `PurchaseOrderItem`
- `PurchaseOrderStatus`
- trạng thái và lượng đã nhận

Procurement gọi:

- Catalog API để xác minh product/variant
- Inventory API để tăng stock
- Identity API khi cần actor/account security context

Không truy cập repository/entity nội bộ của Catalog hoặc Inventory.

Nhập từng phần phải có định danh **lần nhận/receipt** riêng; PO ID + variant ID không đủ vì cùng PO có thể được nhận nhiều lần.

Một request nhận hàng cần receipt ID ổn định, item/variant, quantity và actor.

Procurement kiểm tra lượng được phép nhận và cập nhật received quantity; Inventory chống biến động trùng và ghi ledger, cùng transaction khi business invariant yêu cầu atomic.

Đề xuất unique `(receiptId, purchaseOrderItemId)` tại Procurement và khóa operation phù hợp tại Inventory, ví dụ `(operationId, variantId, movementKind)` sau khi tổng hợp item trùng. Ràng buộc chính xác phải khớp model thật.

Cùng receipt với nội dung khác là conflict. Receipt khác phải được kiểm tra tránh nhận quá số lượng, kể cả khi chạy đồng thời.

---

## 8. Ordering

Ordering trả lời câu hỏi: **khách chọn hàng, checkout và hình thành đơn hàng như thế nào?**

Sở hữu:

- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `OrderHistory`
- `ShippingAddress` dạng snapshot
- `OrderStatus`
- checkout
- order lifecycle
- state machine
- cancel
- return

Ordering gọi các public API được phép của:

- Catalog
- Inventory
- Promotion
- Customer
- Identity khi thật sự cần account/security context

Ordering **không gọi Payment** theo chiều dependency trực tiếp nếu Payment đã phụ thuộc Ordering. Luồng cần phối hợp cả Ordering và Payment được đặt ở workflow/application orchestration phù hợp.

Ordering cung cấp API cần thiết để Payment:

- đọc số tiền/currency/trạng thái thanh toán được phép
- áp dụng payment outcome lũy đẳng

Không có API “set status” tổng quát cho module khác bỏ qua state machine.

API áp dụng payment outcome phải phân biệt:

- đã áp dụng
- duplicate
- order ở trạng thái không tiếp nhận
- late/out-of-order outcome dự kiến

Trường hợp đến muộn dự kiến là kết quả nghiệp vụ để Payment ghi fact/intent; không ném lỗi kỹ thuật làm rollback toàn bộ một cách không cần thiết. Lỗi integrity hoặc kỹ thuật thật sự vẫn phải rollback.

Ordering chốt price, discount, tax/phí nếu hiện có, địa chỉ và item snapshot ở server. Mọi transition kiểm tra trạng thái hiện tại, quyền actor và version/lock.

Phân biệt rõ:

- hủy đơn
- yêu cầu hoàn tiền
- hoàn tiền đang xử lý
- đã hoàn tiền

Không đánh dấu refunded chỉ vì đã gửi yêu cầu refund.

Checkout cần các thay đổi DB cốt lõi như order, stock, coupon và local payment intent/attempt giữ được semantics atomic theo baseline. Cancel cần release stock/rollback coupon/refund intent theo flow thực tế; orchestration không chuyển ownership invariant khỏi module chủ sở hữu.

---

## 9. Payment

Payment trả lời câu hỏi: **tiền của order được xử lý như thế nào?**

Sở hữu:

- `Payment`
- payment attempt
- merchant reference
- provider result
- IPN/webhook
- refund intent
- reconciliation state
- `PaymentStatus`
- `PaymentProvider`

Gateway cụ thể nằm trong `payment.infrastructure.integration`, phía sau port do Payment/application định nghĩa.

Payment chỉ phụ thuộc Ordering API và Identity API khi cần; không truy cập `OrderRepository`, `Order` entity hoặc infrastructure của Ordering.

### 9.1 Thanh toán và callback

- Dùng định danh attempt/merchant reference unique trong DB.
- Idempotency key có scope, payload fingerprint và quy tắc trả lại kết quả cũ.
- Không chỉ dựa vào Redis hoặc kiểm tra “exists” rồi insert.
- Xác minh chữ ký bằng dữ liệu/canonicalization theo provider.
- Đối chiếu reference, amount, currency và trạng thái hợp lệ.
- Khóa hoặc update có điều kiện để callback trùng/đến đồng thời không tạo hiệu ứng lần hai.
- Return URL phục vụ điều hướng/hiển thị; IPN hoặc kết quả provider đã được xác minh mới là nguồn cập nhật theo hợp đồng gateway.
- IPN thành công đến sau cancel/expire vẫn là sự thật tiền đã nhận cần ghi nhận.
- Không tự mở lại order hoặc reserve lại stock.
- Persist kết quả và intent đối soát/hoàn tiền theo chính sách.
- Cancel, expire và IPN tranh chấp phải có thứ tự khóa/state transition nhất quán.
- Có bảng quyết định cho success, failure, duplicate, out-of-order, late và amount mismatch.

### 9.2 Hoàn tiền

Tạo refund intent trong transaction DB trước khi gọi provider.

Intent gồm tối thiểu:

- operation ID duy nhất
- payment reference
- amount/currency
- reason
- status
- attempt/retry metadata
- correlation ID

Tổng số đã hoàn cộng số đang giữ cho refund chưa kết thúc không được vượt số tiền được phép hoàn; kiểm tra này cần lock hoặc update có điều kiện.

Worker gọi HTTP ngoài transaction đang giữ khóa nghiệp vụ.

Timeout/mất kết nối có thể là **chưa rõ kết quả**, không đồng nghĩa thất bại.

Lưu trạng thái `UNKNOWN` hoặc tương đương, đối soát theo khả năng provider; chỉ retry khi biết an toàn và dùng lại định danh logic theo hợp đồng provider.

Nếu không xác định được, đưa vào xử lý vận hành thay vì tạo request mới mù quáng.

Tên trạng thái cụ thể phải ánh xạ vào model hiện có; tối thiểu phân biệt:

- pending/in-flight
- succeeded
- failed xác định
- unknown

Crash giữa provider success và DB update phải được phục hồi bằng reconciliation/idempotency phù hợp.

---

## 10. Notification

Notification trả lời câu hỏi: **thông báo nghiệp vụ được lưu và gửi như thế nào?**

Sở hữu:

- `Notification`
- `NotificationType`
- inbox/thông báo nghiệp vụ
- mark read
- delete notification
- contact/business message
- adapter gửi thông báo chung

Notification có thể import event/API của publisher theo ma trận dependency.

Với business notification, Notification có thể lấy customer/contact snapshot qua Customer API khi phù hợp. Với security notification/OTP, ownership vẫn thuộc Identity và không bắt buộc đi qua Notification.

Publisher không import Notification chỉ để phát event.

Notification lỗi không rollback checkout.

Nếu thông báo bắt buộc phải giao, dùng publication bền, retry có giới hạn/backoff, trạng thái lỗi và dedup phù hợp như `(eventId, recipient, channel)`.

Nếu email/provider không hỗ trợ idempotency end-to-end, phải ghi nhận và giảm thiểu khả năng gửi trùng thay vì cam kết exactly-once.

---

## 11. Assistant

Assistant trả lời câu hỏi: **AI/chatbot hỗ trợ người dùng dựa trên dữ liệu Ladux như thế nào?**

Assistant sở hữu logic application cho:

- chat/query với sales assistant
- indexing/reindexing dữ liệu phục vụ AI
- semantic search orchestration
- prompt/application policy của assistant

Assistant không sở hữu Product/Order/Customer entity.

Dữ liệu sản phẩm phải được lấy qua Catalog API/projection phù hợp; không truy cập `ProductRepository` hoặc Catalog internals.

Các external AI/search systems nằm phía sau output port, ví dụ:

- `LanguageModelPort`
- `SemanticSearchPort`

Adapter cụ thể như Spring AI, vector search hoặc provider AI nằm trong `assistant.infrastructure.integration`.

Assistant không được trở thành đường vòng để module khác truy cập internals của Catalog/Customer/Ordering.

---

## 12. Shared và Workflow

### 12.1 Shared

`shared` chỉ chứa:

- lỗi nền tảng
- pagination trung lập
- clock/time
- ID/correlation/actor primitive
- technical primitive dùng chung
- cấu hình kỹ thuật chung thực sự

Không chứa:

- `User`
- `Customer`
- `Product`
- `Order`
- business repository
- business service tổng hợp
- DTO chứa entity
- business policy của module cụ thể

Primitive công khai đặt ở `shared.api`, không tham chiếu framework/SDK hoặc shared internals.

Cấu hình/adapter dùng chung đặt ở `shared.infrastructure`.

Module khác chỉ import shared API khi cần, không đi tắt qua shared infrastructure.

Shared không import module nghiệp vụ hay workflow.

### 12.2 Workflow

`workflow` chỉ điều phối qua public module API.

Không tạo:

- domain entity
- repository nghiệp vụ
- business table/schema riêng
- ownership mới cho state vốn thuộc module khác

Workflow có thể dùng cho luồng cần phối hợp nhiều module mà nếu đặt trong một module nghiệp vụ sẽ tạo dependency cycle, ví dụ orchestration giữa Ordering và Payment.

Worker/event infrastructure dùng cơ chế publication đã chọn; state thuộc Order, Payment, Customer, Identity… phải được ghi qua module chủ sở hữu.

Nếu cần process state lâu dài riêng, phải bổ sung ADR xác định ownership trước khi mở rộng vai trò workflow.

---

## 13. Quy tắc tổng quát

1. **Ownership trước package:** class/entity thuộc module sở hữu business invariant của nó.
2. **Cross-module chỉ qua public API:** không import repository/entity/application internal của module khác.
3. **ID/snapshot thay cho JPA association chéo module:** foreign key DB không đồng nghĩa được import entity.
4. **Writer duy nhất cho invariant quan trọng:** đặc biệt stock thuộc Inventory.
5. **Ordering không điều khiển Payment internals; Payment không điều khiển Order internals.**
6. **Identity = account/security; Customer = profile/CRM/loyalty.**
7. **Workflow điều phối, không sở hữu business state.**
8. **Shared không trở thành “common business module”.**
9. **API internal vẫn phải kiểm tra authorization/invariant cần thiết.**
10. **ArchUnit bảo vệ dependency Java nhưng không thay thế review SQL, transaction, lock, reflection, cache, scheduler và integration test.**

API có thể được phép về chiều import nhưng vẫn phải tuân thủ quyền dữ liệu. Contract “internal” không miễn xác thực/ủy quyền và kiểm tra invariant.
