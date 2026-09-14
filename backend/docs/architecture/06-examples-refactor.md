# Backend Ladux — Ví dụ refactor

Các ví dụ minh họa ranh giới và invariant, không phải patch đã biên dịch với repository. Tên port, DTO, bảng/cột và phương thức phải đối chiếu source thật. Những kiểu chưa khai báo trong một đoạn là thành phần của lát cắt cần triển khai; không sao chép đoạn rút gọn rồi coi là use case production hoàn chỉnh.

## 1. Gom query đơn giản và giữ controller mỏng

Không bắt buộc một class cho mỗi GET. Các truy vấn cùng ownership có thể ở `OrderQueries`, còn persistence đi qua port do application sở hữu.

```java
// ordering/application/query/OrderQueries.java
package org.akira.ladux.ordering.application.query;

import org.akira.ladux.ordering.application.port.out.OrderReadStore;
import org.akira.ladux.shared.api.Actor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrderQueries {
    private final OrderReadStore orders;

    public OrderQueries(OrderReadStore orders) {
        this.orders = orders;
    }

    public OrderDetail getMyOrder(Integer orderId, Actor actor) {
        // Port lọc theo owner; use case có thể thêm policy cho admin riêng.
        // Không lấy ownerId tùy ý từ body để bỏ qua quyền sở hữu.
        return orders.findOwnedDetail(orderId, actor.userId())
            .orElseThrow(OrderNotFoundException::new);
    }

    public OrderPage listMyOrders(OrderPageQuery query, Actor actor) {
        return orders.findOwnedPage(actor.userId(), query);
    }
}
```

`OrderReadStore` thuộc `ordering.application.port.out`, trả projection/DTO của application, không trả Spring Data `Page`. Adapter JPA thuộc `ordering.infrastructure.persistence`. Controller thuộc `ordering.infrastructure.web`, gọi class **public** này và ánh xạ sang REST DTO hiện có. `Actor` là primitive bất biến ở `shared.api`, do adapter xác thực tạo; không chứa token hay entity User.

`OrderDetail`, `OrderPage`, `OrderPageQuery` và lỗi trong ví dụ là DTO/lỗi nội bộ application. Nếu module khác cần query, định nghĩa contract riêng ở `ordering.api`; không cho module khác import `OrderQueries`. Không cần interface input port cho query chỉ dùng nội bộ nếu không đem lại ranh giới hữu ích.

## 2. API trả snapshot, không trả entity

```java
// catalog/api/ProductSnapshot.java
package org.akira.ladux.catalog.api;

import java.math.BigDecimal;

public record ProductSnapshot(
    Integer variantId,
    String sku,
    String displayName,
    BigDecimal unitPrice,
    String currency
) {}
```

Catalog API trả snapshot bất biến và có batch lookup. Ordering ánh xạ snapshot sang `OrderItem` nội bộ, chốt giá/currency/discount theo chính sách server. API của Ordering không xuất tiếp `ProductSnapshot` như field của DTO Ordering; ánh xạ dữ liệu cần thiết sang kiểu của Ordering.

Không dùng `ProductResponse.fromEntity(Product)` ở module khác. `ProductResponse` là REST DTO của Catalog, entity là nội bộ Catalog; cả hai không phải contract cho Ordering. Stock/availability được Inventory cung cấp riêng và workflow ghép vào response đọc khi cần.

## 3. Checkout gồm order và local payment attempt

Mẫu này áp dụng khi baseline yêu cầu hai phần DB cùng nguyên tử. Không áp dụng để thay đổi API hoặc luồng đang tách giao dịch có chủ đích.

```java
// workflow/application/CheckoutWorkflow.java
package org.akira.ladux.workflow.application;

import org.akira.ladux.ordering.api.OrderingCheckout;
import org.akira.ladux.ordering.api.PlaceOrderCommand;
import org.akira.ladux.payment.api.PaymentAttempts;
import org.akira.ladux.payment.api.StartPaymentCommand;
import org.akira.ladux.shared.api.Actor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckoutWorkflow {
    private final OrderingCheckout ordering;
    private final PaymentAttempts payments;

    public CheckoutWorkflow(OrderingCheckout ordering, PaymentAttempts payments) {
        this.ordering = ordering;
        this.payments = payments;
    }

    @Transactional
    public CheckoutResult checkout(CheckoutCommand command, Actor actor) {
        var order = ordering.place(new PlaceOrderCommand(
            command.operationId(), command.cartId(), actor));
        var attempt = payments.startLocalAttempt(new StartPaymentCommand(
            command.operationId(), order.orderId(), command.provider(), actor));
        return new CheckoutResult(order.orderId(), attempt.attemptId(),
            attempt.redirectUrl());
    }
}
```

Contract rút gọn của `place` cần bao quát lựa chọn địa chỉ/coupon/giao hàng thật. Ordering kiểm tra user/cart ownership, khóa giỏ, xác minh giá, reserve stock, redeem coupon, lưu order/item/history và dọn giỏ theo baseline. Payment đọc order qua `ordering.api` để lấy amount/currency có thẩm quyền, rồi tạo attempt/ref hoặc trả attempt đã có.

Cả hai API tham gia cùng transaction manager/propagation; không `REQUIRES_NEW`. Idempotency được scope theo loại operation và actor, lưu trong DB với payload fingerprint; không chỉ dựa vào UUID truyền từ workflow. Transaction rollback thì không để lại dấu hoàn tất giả.

`startLocalAttempt` chỉ làm DB và có thể ký URL cục bộ. Nếu provider cần HTTP để tạo session/transaction, method ghi intent; worker gọi provider sau commit và REST response phải giữ semantics hoặc có thay đổi contract riêng được quyết định rõ. Không giấu lời gọi mạng bên trong một method được đặt tên “local”.

## 4. Hủy đơn và refund intent

```java
// ordering/application/command/CancelOrderUseCase.java
package org.akira.ladux.ordering.application.command;

import org.akira.ladux.inventory.api.InventoryOperations;
import org.akira.ladux.promotion.api.PromotionOperations;
import org.akira.ladux.ordering.application.port.out.OrderStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CancelOrderUseCase {
    private final OrderStore orders;
    private final InventoryOperations inventory;
    private final PromotionOperations promotion;

    public CancelOrderUseCase(OrderStore orders, InventoryOperations inventory,
                             PromotionOperations promotion) {
        this.orders = orders;
        this.inventory = inventory;
        this.promotion = promotion;
    }

    @Transactional
    public CancelResult cancel(CancelCommand command) {
        var order = orders.lockForUpdate(command.orderId());
        order.assertCanBeAccessedBy(command.actor());
        // Hàm trả kết quả đã lưu phải kiểm tra operation ID + payload,
        // không chỉ thấy status CANCELLED là bỏ qua mọi kiểm tra.
        var previous = order.findCancellation(command.operationId(), command.reason());
        if (previous.isPresent()) return toResult(previous.get());

        order.assertCancellable();
        inventory.releaseForOrder(toReleaseCommand(order, command.operationId()));
        if (order.hasCouponRedemption()) {
            promotion.rollback(toCouponRollbackCommand(order, command.operationId()));
        }
        var cancellation = order.cancel(command.operationId(), command.reason(), command.actor());
        orders.save(order); // Bao gồm lịch sử và dữ liệu chống xử lý lặp.
        return toResult(cancellation);
    }
}
```

Các helper `toReleaseCommand`, `toCouponRollbackCommand`, `toResult` được lược bỏ trong ví dụ; chúng thuộc application và ánh xạ domain nội bộ sang command/result tương ứng. Domain Order chỉ trả cancellation/value của chính domain, không import application DTO hay Inventory/Promotion API. Các command gửi Inventory/Promotion chứa ID/reservation/redemption/snapshot cần thiết, không chứa order entity. Lỗi stock/coupon phải rollback cancellation cùng DB. Trạng thái terminal và điều kiện được hủy do Ordering sở hữu.

Nếu hủy cần tạo refund intent nguyên tử, workflow mở transaction ngoài, gọi Ordering cancellation API rồi Payment refund-request API; cả hai `REQUIRED`. Sau commit, worker của Payment thực hiện HTTP hoàn tiền. Ordering không import Payment; trạng thái order cancelled độc lập với refund pending/succeeded/unknown.

Refund API phải cho phép truy vấn số tiền/quyền hoàn từ Order đã hủy hợp lệ và payment đã thu; không yêu cầu order vẫn ở trạng thái “đang thanh toán”. Kiểm thử thất bại tạo intent khiến toàn thao tác hủy rollback nếu baseline yêu cầu nguyên tử.

## 5. Kiểm soát stock writer và dữ liệu stale

Mapping dưới chỉ minh họa trường stock tại Catalog sau khi default khởi tạo 0 được xác minh/cài bằng migration mới:

```java
@Column(name = "stock_quantity", insertable = false, updatable = false)
private int stockQuantity;
```

Catalog không có setter/mapper ghi stock và không được native-update cột này. `insertable=false` không tự tạo default; nếu schema chưa đáp ứng, không sao chép cấu hình đó trước bước chuẩn bị. Khởi tạo tồn khác 0 đi qua Inventory và ledger trong cùng transaction tạo dữ liệu.

Ví dụ SQL khái niệm cho adapter Inventory khi `stock_quantity` là lượng khả dụng; tên bảng/cột/version phải ánh xạ schema thật:

```sql
UPDATE product_variant
SET stock_quantity = stock_quantity - :quantity,
    version = version + 1
WHERE id = :variant_id
  AND :quantity > 0
  AND stock_quantity >= :quantity
RETURNING stock_quantity, version;
```

Không có row trả về nghĩa là variant không hợp lệ hoặc không đủ stock; adapter ánh xạ lỗi phù hợp. Câu SQL này **chưa phải toàn bộ reserve**: vẫn cần claim operation ID có unique constraint, xác minh payload, ghi reservation/ledger và kết quả cùng transaction. Nếu operation trùng, đọc kết quả đã commit hoặc retry theo isolation của transaction; không trừ stock rồi bắt duplicate exception để tiếp tục commit.

Native/bulk update không tự cập nhật entity đã load trong persistence context. Khi Catalog đọc tiếp trong cùng transaction, dùng projection/refresh có chủ đích; sau commit vô hiệu hóa cache liên quan. Nếu Catalog có optimistic update dùng chung version, xử lý xung đột đúng; không bỏ version check để né lỗi. [Jakarta Persistence](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2).

Kiểm thử quan trọng: load Catalog entity → Inventory đổi stock → Catalog sửa tên/save → stock vẫn đúng, ledger khớp và cache không dùng để quyết định reserve. Kiểm tra import/job/admin update bên cạnh JPA save.

## 6. Nhập hàng có receipt ID

```java
// inventory/api/ReceivePurchaseStockCommand.java
package org.akira.ladux.inventory.api;

import java.util.UUID;
import org.akira.ladux.shared.api.Actor;

public record ReceivePurchaseStockCommand(
    UUID operationId,
    UUID receiptId,
    Integer purchaseOrderId,
    Integer purchaseOrderItemId,
    Integer variantId,
    int quantity,
    Actor actor
) {
    public ReceivePurchaseStockCommand {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");
        // Khi triển khai: kiểm tra null, format và giới hạn quantity theo domain.
    }
}
```

Procurement khóa PO/item, kiểm tra actor và lượng còn được nhận, ghi receipt rồi gọi Inventory, cập nhật received quantity và commit cùng ledger. `receiptId` ổn định cho retry, khác nhau giữa các lần nhận hợp lệ; operation ID có thể dẫn xuất ổn định theo receipt/item/loại để khớp dedup Inventory.

Không dùng chỉ `(purchaseOrderId, variantId)` làm khóa chống trùng: nó sẽ chặn lần nhận từng phần hợp lệ tiếp theo. Không dùng UUID mới mỗi retry: nó làm mất khả năng nhận ra request lặp. Cùng ID nhưng quantity/variant khác phải conflict. Bổ sung unique constraint, không chỉ query-before-insert.

## 7. Tiền và VNPay adapter

Core Payment dùng tiền có currency và quy tắc làm tròn rõ, không dùng `double`. Đơn vị provider được chuyển đổi duy nhất trong adapter. Với giao thức VNPay PAY tham chiếu, `vnp_Amount` là số tiền nhân 100 và trường dạng số có giới hạn độ dài; kiểm tra hợp đồng provider đang tích hợp. [VNPay PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).

```java
// Ví dụ cho giao dịch VND nguyên đồng theo chính sách của ứng dụng.
// Không áp dụng cho currency khác hoặc tự làm tròn số tiền khách phải trả.
static String toVnpAmount(long amountVnd) {
    if (amountVnd <= 0) throw new IllegalArgumentException("Invalid amount");
    long providerAmount = Math.multiplyExact(amountVnd, 100L);
    if (providerAmount > 999_999_999_999L) {
        throw new IllegalArgumentException("Provider amount exceeds 12 digits");
    }
    return Long.toString(providerAmount);
}
```

Nếu core dùng `BigDecimal`, xác minh amount/currency và chuyển sang integer bằng phép chuyển chính xác theo policy; không âm thầm truncate. Chữ ký, sort/encode tham số, response code và secret thuộc VNPay adapter. Payment application chỉ nhận kết quả đã ánh xạ, nhưng vẫn đối chiếu reference/amount/currency/order policy.

Tách ý nghĩa port theo khả năng provider: ký redirect URL cục bộ, xác minh notification, query giao dịch và request/query refund. Không ép mọi provider có cùng hành vi hoàn tiền hoặc coi `createRedirect()` là đại diện đầy đủ vòng đời Payment.

## 8. Callback và race với hủy/hết hạn

| Tình huống | Xử lý bắt buộc |
| --- | --- |
| Chữ ký/reference/amount không hợp lệ | Không cập nhật payment/order thành công; phản hồi theo protocol và ghi log an toàn |
| Success đầu tiên, order còn chấp nhận payment | Ghi payment outcome + order transition nguyên tử, bảo vệ concurrency |
| Callback hợp lệ trùng | Trả kết quả idempotent theo protocol, không transition/ledger lần hai |
| Success đến khi order cancelled/expired | Ghi bền sự thật đã nhận tiền và intent xử lý ngoại lệ; không tự mở lại order |
| Failure tới sau success | Không hạ trạng thái thành công chỉ vì thứ tự mạng; áp dụng bảng transition đã chốt |
| Cancel và success đồng thời | Cùng thứ tự khóa/quy tắc state; kết quả cuối có thể đối soát được |

Không suy ra HTTP response/IPN code cụ thể từ bảng này; adapter phải ánh xạ đúng hợp đồng gateway thực tế. Return URL không phải bằng chứng độc lập cho thanh toán thành công.

## 9. Refund worker ngoài transaction giữ khóa

Trình tự sau là mã giả về transaction, không phải Java để dán vào source:

```text
Transaction A:
  khóa payment/refund liên quan
  kiểm tra refundable balance và idempotency
  lưu refund intent + giữ phần tiền đang chờ hoàn
  commit

Worker:
  claim intent bằng lease/claim có kiểm soát trong transaction ngắn
  gọi provider ngoài transaction giữ khóa nghiệp vụ
  nhận success / failure xác định / kết quả chưa rõ

Transaction B:
  kiểm tra claim/version và trạng thái hiện tại
  lưu kết quả + event/outbox cần thiết
  chỉ giải phóng khoản giữ theo chính sách của trạng thái đã xác định
  commit
```

Lease hết hạn không chứng minh request cũ chưa tới provider. Worker mới phải query/reconcile khi attempt trước có thể đã được gửi; không tự POST thêm refund. Timeout giữ trạng thái unknown/pending reconciliation và phần tiền liên quan cho tới khi kết quả được xác định. Provider request ID, merchant operation ID và DB unique constraint phải có quan hệ ổn định; không hứa retry an toàn nếu provider không hỗ trợ.

Nếu dùng Spring proxy, tách các method transaction A/B sang bean hoặc dùng `TransactionTemplate`; không gọi method `@Transactional` nội bộ cùng object rồi cho rằng proxy đã áp dụng. Kiểm thử crash ở từng khoảng giữa các bước.

## 10. Event bền và chiều import

`OrderDeliveredEvent` thuộc `ordering.api.event`. Listener Notification import kiểu đó: dependency Java là Notification → Ordering API. Nếu cần cập nhật Customer points tại Identity, listener đặt ở workflow và gọi Identity API; không đưa import Ordering vào Identity.

Event bắt buộc không mất được lưu cùng transaction gốc bằng outbox/registry đã chọn. Worker đọc publication bền; consumer áp dụng hiệu ứng và dedup cùng transaction. Với `AFTER_COMMIT` listener không có storage bền, crash sau commit có thể mất hiệu ứng; annotation không tự thay thế cơ chế này. [Spring Modulith events](https://docs.spring.io/spring-modulith/reference/events.html).

Trước khi dùng event, trả lời: có được phép mất không, có thể đến trùng/đảo thứ tự không, ai retry, ai replay, payload có cần version và ai theo dõi backlog? Nếu lỗi phải rollback stock/coupon/order hiện tại, dùng API đồng bộ.

## 11. Các kiểm tra trước khi nhận ví dụ vào source

- Đối chiếu kiểu ID/tiền, chữ ký method, schema và dependency version thật; giữ REST JSON và error semantics.
- Xác nhận bean/public visibility, injection, proxy/transaction manager và propagation bằng wiring/integration test phù hợp.
- Kiểm tra quyền actor, payload null/invalid và invariant tại API/use case, không chỉ tại web.
- Chạy các test đồng thời/rollback/retry liên quan, ArchUnit với fixture và Maven verify thực sự có test được khám phá.
- Ghi rõ bridge/exception còn lại. Không dùng các đoạn rút gọn này làm bằng chứng runtime đã ổn định.
