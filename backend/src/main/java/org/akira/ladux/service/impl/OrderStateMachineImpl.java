package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.akira.ladux.dto.request.admin.OrderStatusUpdateRequest;
import org.akira.ladux.dto.response.user.OrderResponse;
import org.akira.ladux.event.OrderDeliveredEvent;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.OrderHistory;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.service.OrderLifecycleService;
import org.akira.ladux.service.OrderStateMachine;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

// State machine quan ly vong doi don hang.
// Chuyen trang thai hop le:
//   PENDING    -> CONFIRMED | CANCELLED
//   CONFIRMED  -> SHIPPED   | CANCELLED
//   SHIPPED    -> DELIVERED
//   CANCELLED, DELIVERED -> trang thai cuoi, khong chuyen tiep
// CONFIRMED thuong do confirmAfterSuccessfulPayment (luong thanh toan), khong qua updateOrderStatus.
// Huy don (-> CANCELLED) luon qua OrderLifecycleService.cancelOrder de hoan kho/coupon.
@Service
@RequiredArgsConstructor
public class OrderStateMachineImpl implements OrderStateMachine {
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true)
    })
    public OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request) {
        // Khóa bi quan order + items để tránh hai admin cùng đổi trạng thái song song.
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
                .user(order.getUser())
                .status(target)
                .description("Order status changed from " + current.name() + " to " + target.name())
                .build());
        if (target == OrderStatus.DELIVERED) {
            eventPublisher.publishEvent(new OrderDeliveredEvent(order));
        }
        return OrderResponse.fromEntity(order);
    }

    @Override
    @Scheduled(fixedDelayString = "${ladux.order-expiration.fixed-delay-ms:60000}")
    @Transactional
    @SchedulerLock(name = "expirePendingOrdersLock", lockAtMostFor = "10m", lockAtLeastFor = "1m")
    @Caching(evict = {


            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "coupons", allEntries = true)
    })
    // Job dinh ky (mac dinh 60s): huy don PENDING qua paymentExpiresAt. ShedLock chan chay trung khi scale ngang.
    public void expirePendingOrders() {
        List<Order> expiredOrders = orderRepository.findExpiredOrdersForUpdate(OrderStatus.PENDING, Instant.now());
        for (Order order : expiredOrders) {
            orderLifecycleService.cancelOrder(order, "Payment window expired");
        }
    }

    // Kiem tra ma tran chuyen trang thai — nem BusinessRuleException neu khong hop le.
    private void validateTransition(OrderStatus current, OrderStatus target) {
        // 1. Các trạng thái cuối cùng, hoàn tất hoàn toàn không thể chuyển tiếp
        if (current == OrderStatus.CANCELLED || current == OrderStatus.REFUNDED) {
            throw new BusinessRuleException("Đơn hàng ở trạng thái " + current + " không thể chuyển trạng thái nữa");
        }

        // 2. Kiểm tra điều kiện HỦY ĐƠN (CANCELLED)
        if (target == OrderStatus.CANCELLED) {
            if (current == OrderStatus.PENDING || current == OrderStatus.CONFIRMED) {
                return;
            }
            throw new BusinessRuleException("Chỉ hủy đơn khi đơn đang PENDING hoặc CONFIRMED");
        }

        // 3. Ma trận chuyển đổi trạng thái hợp lệ
        boolean allowed = switch (current) {
            case PENDING -> target == OrderStatus.CONFIRMED;
            case CONFIRMED -> target == OrderStatus.SHIPPED;
            case SHIPPED -> target == OrderStatus.DELIVERED;

            // LUỒNG ĐỔI TRẢ & HOÀN TIỀN MỚI BỔ SUNG:
            case DELIVERED -> target == OrderStatus.RETURN_REQUESTED || target == OrderStatus.RETURNED;
            case RETURN_REQUESTED -> target == OrderStatus.RETURNED || target == OrderStatus.DELIVERED; // RETURNED (Duyệt) hoặc DELIVERED (Từ chối)
            case RETURNED -> target == OrderStatus.REFUNDED;

            default -> false;
        };

        if (!allowed) {
            throw new BusinessRuleException("Trạng thái đơn hàng không hợp lệ khi chuyển từ " + current + " sang " + target);
        }
    }
}

