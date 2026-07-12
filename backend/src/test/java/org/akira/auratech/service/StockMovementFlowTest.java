package org.akira.auratech.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
  
import org.akira.auratech.AbstractIntegrationTest;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.request.PurchaseOrderCreateRequest;
import org.akira.auratech.dto.request.PurchaseOrderItemRequest;
import org.akira.auratech.dto.request.PurchaseOrderReceiveRequest;
import org.akira.auratech.dto.request.StockMovementRequest;
import org.akira.auratech.dto.response.PurchaseOrderResponse;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.CartItem;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.StockMovement;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PurchaseOrderStatus;
import org.akira.auratech.model.enums.StockMovementType;
import org.akira.auratech.model.enums.StockReferenceType;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Integration test cho SO CAI BIEN DONG KHO (stock_movements) — Phuong an A:
 * moi thay doi ton kho deu de lai 1 dong trong so cai, va ton kho KHONG bi tru/cong KEP.
 *
 * <p>Phu thuoc seed: user id 1 = admin; supplier id 1 = seed V23 (devdata).
 * @Transactional cap class -> rollback sau moi test. Vi tru kho dung JPQL bulk-update
 * (bo qua persistence context), goi {@code em.flush(); em.clear();} truoc khi doc lai.
 */
@Transactional
class StockMovementFlowTest extends AbstractIntegrationTest {

    @Autowired OrderService orderService;
    @Autowired PurchaseOrderService purchaseOrderService;
    @Autowired StockMovementService stockMovementService;
    @Autowired CartRepository cartRepository;
    @Autowired ProductRepository productRepository;
    @Autowired BrandRepository brandRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired StockMovementRepository stockMovementRepository;

    @PersistenceContext
    EntityManager em;

    private static final int USER_ID = 2;   // quang_huy
    private static final int ADMIN_ID = 1;  // admin
    private static final int SUPPLIER_ID = 1; // seed V23

    private Product newProduct(int stock, String price) {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        return productRepository.save(Product.builder()
                .brand(brandRepository.findAll().get(0))
                .category(categoryRepository.findAll().get(0))
                .sku("SM-" + unique)
                .name("SM Product " + unique)
                .slug("sm-product-" + unique)
                .basePrice(new BigDecimal(price))
                .stockQuantity(stock)
                .isActive(true)
                .build());
    }

    private void setCartSingleItem(int userId, Product product, int qty) {
        Cart cart = cartRepository.findByUserIdForUpdate(userId).orElseThrow();
        cart.getItems().clear();
        cart.getItems().add(CartItem.builder().cart(cart).product(product).quantity(qty).build());
        cartRepository.save(cart);
    }

    private Order newestOrderOf(int userId) {
        return orderRepository
                .findByUserId(userId, PageRequest.of(0, 1, Sort.by("id").descending()))
                .getContent().get(0);
    }

    private int stockOf(int productId) {
        return productRepository.findById(productId).orElseThrow().getStockQuantity();
    }

    private List<StockMovement> movementsOf(int productId) {
        return stockMovementRepository
                .findByProductId(productId, PageRequest.of(0, 50, Sort.by("id")))
                .getContent();
    }

    @Test
    void checkout_writesSaleOutMovement_andDeductsStockOnce() {
        Product product = newProduct(10, "500.00");
        setCartSingleItem(USER_ID, product, 3);

        orderService.createOrder(USER_ID, new OrderRequest(null, PaymentProvider.COD, "addr"));
        em.flush();
        em.clear();

        // Ton kho giam DUNG 3 (khong tru kep).
        assertEquals(7, stockOf(product.getId()), "Ban 3 -> ton 10-3=7, khong duoc tru kep");

        // So cai: dung 1 dong SALE_OUT, quantity = -3, tham chieu ve don hang.
        List<StockMovement> movements = movementsOf(product.getId());
        assertEquals(1, movements.size(), "Phai co dung 1 bien dong sau khi ban");
        StockMovement sale = movements.get(0);
        assertEquals(StockMovementType.SALE_OUT, sale.getMovementType());
        assertEquals(-3, sale.getQuantity(), "Ban hang ghi so am");
        assertEquals(StockReferenceType.ORDER, sale.getReferenceType());
        assertEquals(newestOrderOf(USER_ID).getId().longValue(), sale.getReferenceId(),
                "Bien dong phai tham chieu dung don hang vua tao");
    }

    @Test
    void cancelOrder_writesReturnInMovement_andRestoresStock() {
        Product product = newProduct(10, "1000.00");
        setCartSingleItem(USER_ID, product, 4);

        orderService.createOrder(USER_ID, new OrderRequest(null, PaymentProvider.COD, "addr"));
        em.flush();
        em.clear();
        Order order = newestOrderOf(USER_ID);
        assertEquals(6, stockOf(product.getId()), "Sau ban: 10-4=6");

        orderService.updateOrderStatus(order.getId(),
                new OrderStatusUpdateRequest(OrderStatus.CANCELLED, null));
        em.flush();
        em.clear();

        // Ton kho hoan ve 10 (cong DUNG 4, khong cong kep).
        assertEquals(10, stockOf(product.getId()), "Huy don -> hoan kho ve 10");

        // So cai: SALE_OUT (-4) + RETURN_IN (+4); tong bien dong = 0.
        List<StockMovement> movements = movementsOf(product.getId());
        assertEquals(2, movements.size(), "Phai co 2 bien dong: ban + hoan");
        assertEquals(StockMovementType.SALE_OUT, movements.get(0).getMovementType());
        assertEquals(-4, movements.get(0).getQuantity());
        assertEquals(StockMovementType.RETURN_IN, movements.get(1).getMovementType());
        assertEquals(4, movements.get(1).getQuantity());
        int net = movements.stream().mapToInt(StockMovement::getQuantity).sum();
        assertEquals(0, net, "Ban roi hoan -> tong bien dong bang 0");
    }

    @Test
    void manualAdjustment_damageOut_decreasesStock_andWritesMovement() {
        Product product = newProduct(10, "500.00");

        stockMovementService.createAdjustment(
                new StockMovementRequest(product.getId(), 2, StockMovementType.DAMAGE_OUT, "Vo 2 cai khi kiem ke"),
                ADMIN_ID);
        em.flush();
        em.clear();

        assertEquals(8, stockOf(product.getId()), "Hao hut 2 -> ton 10-2=8");

        List<StockMovement> movements = movementsOf(product.getId());
        assertEquals(1, movements.size());
        StockMovement m = movements.get(0);
        assertEquals(StockMovementType.DAMAGE_OUT, m.getMovementType());
        assertEquals(-2, m.getQuantity(), "Hao hut ghi so am");
        assertEquals(StockReferenceType.ADJUSTMENT, m.getReferenceType());
    }

    @Test
    void purchaseOrderReceive_purchaseIn_increasesStock_andWritesMovement() {
        Product product = newProduct(5, "500.00");

        PurchaseOrderResponse po = purchaseOrderService.createPurchaseOrder(
                new PurchaseOrderCreateRequest(
                        SUPPLIER_ID, null, "Nhap bo sung",
                        List.of(new PurchaseOrderItemRequest(
                                product.getId(), 10, new BigDecimal("300.00"), null))),
                ADMIN_ID);
        em.flush();
        em.clear();

        int itemId = po.items().get(0).id();
        PurchaseOrderResponse received = purchaseOrderService.receiveGoods(
                po.id(),
                new PurchaseOrderReceiveRequest(List.of(
                        new PurchaseOrderReceiveRequest.ReceiveLine(itemId, 10))),
                ADMIN_ID);
        em.flush();
        em.clear();

        // Ton kho tang DUNG 10 (5 -> 15), khong cong kep.
        assertEquals(15, stockOf(product.getId()), "Nhan 10 -> ton 5+10=15");
        assertEquals(PurchaseOrderStatus.RECEIVED, received.status(), "Nhan du -> don ve RECEIVED");

        List<StockMovement> movements = movementsOf(product.getId());
        assertEquals(1, movements.size());
        StockMovement m = movements.get(0);
        assertEquals(StockMovementType.PURCHASE_IN, m.getMovementType());
        assertEquals(10, m.getQuantity(), "Nhap hang ghi so duong");
        assertEquals(StockReferenceType.PURCHASE_ORDER, m.getReferenceType());
        assertEquals(po.id().longValue(), m.getReferenceId(), "Bien dong tham chieu dung don mua");
    }
}
