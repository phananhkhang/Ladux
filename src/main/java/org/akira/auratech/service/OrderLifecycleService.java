package org.akira.auratech.service;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.model.OrderItem;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderLifecycleService {
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    public void confirmAfterSuccessfulPayment(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Don hang da bi huy, khong the xac nhan thanh toan");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang da duoc van chuyen, khong the cap nhat thanh toan");
        }
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            order.setPaymentExpiresAt(null);
            return;
        }
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentExpiresAt(null);
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED.name())
                .description("Payment succeeded")
                .build());
    }

    public void cancelOrder(Order order, String description) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return;
        }
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new BusinessRuleException("Don hang da duoc van chuyen, khong the huy");
        }

        releaseReservedInventory(order);
        rollbackCouponUsage(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentExpiresAt(null);
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(OrderStatus.CANCELLED.name())
                .description(description)
                .build());
    }

    private void releaseReservedInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            Integer productId = item.getProduct().getId();
            Product product = productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + productId));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }
    }

    private void rollbackCouponUsage(Order order) {
        if (order.getCoupon() == null) {
            return;
        }
        Integer couponId = order.getCoupon().getId();
        Coupon coupon = couponRepository.findByIdForUpdate(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + couponId));
        if (coupon.getUsedCount() > 0) {
            coupon.setUsedCount(coupon.getUsedCount() - 1);
        }
    }
}
