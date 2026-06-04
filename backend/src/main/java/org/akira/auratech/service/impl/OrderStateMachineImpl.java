package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.service.OrderLifecycleService;
import org.akira.auratech.service.OrderStateMachine;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderStateMachineImpl implements OrderStateMachine {
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findWithItemsByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        OrderStatus current = order.getStatus();
        OrderStatus target = request.status();
        if (current == target) {
            return OrderResponse.fromEntity(order);
        }

        validateTransition(current, target);
        if (target == OrderStatus.CANCELLED) {
            orderLifecycleService.cancelOrder(order, "Order cancelled by user");
            return OrderResponse.fromEntity(order);
        }
        if (target == OrderStatus.SHIPPED) {
            if (request.trackingNumber() == null || request.trackingNumber().isBlank()) {
                throw new BusinessRuleException("TrackingNumber bat buoc khi chuyen sang SHIPPED");
            }
            order.setTrackingNumber(request.trackingNumber());
        }

        order.setStatus(target);
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(target.name())
                .description("Order status changed from " + current.name() + " to " + target.name())
                .build());
        return OrderResponse.fromEntity(order);
    }

    @Override
    @Scheduled(fixedDelayString = "${auratech.order-expiration.fixed-delay-ms:60000}")
    @Transactional
    public int expirePendingOrders() {
        List<Order> expiredOrders = orderRepository.findExpiredOrdersForUpdate(OrderStatus.PENDING, Instant.now());
        for (Order order : expiredOrders) {
            orderLifecycleService.cancelOrder(order, "Payment window expired");
        }
        return expiredOrders.size();
    }

    private void validateTransition(OrderStatus current, OrderStatus target) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang o trang thai " + current + " khong the chuyen trang thai");
        }
        if (target == OrderStatus.CANCELLED) {
            if (current == OrderStatus.PENDING || current == OrderStatus.CONFIRMED) {
                return;
            }
            throw new BusinessRuleException("Chi huy don khi don dang PENDING hoac CONFIRMED");
        }
        boolean allowed = (current == OrderStatus.PENDING && target == OrderStatus.CONFIRMED)
                || (current == OrderStatus.CONFIRMED && target == OrderStatus.SHIPPED)
                || (current == OrderStatus.SHIPPED && target == OrderStatus.DELIVERED);
        if (!allowed) {
            throw new BusinessRuleException("Trang thai don hang khong duoc nhay coc tu " + current + " sang " + target);
        }
    }
}

