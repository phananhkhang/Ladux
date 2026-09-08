package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.akira.ladux.dto.order.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.order.response.OrderResponse;
import org.akira.ladux.event.OrderDeliveredEvent;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.OrderHistory;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.OrderLifecycleService;
import org.akira.ladux.service.OrderStateMachine;
import org.akira.ladux.service.PaymentService;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

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
    private final PaymentService paymentService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;

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
        User admin = resolveAdminUser(order);

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

        if (current == OrderStatus.RETURN_REQUESTED && target == OrderStatus.DELIVERED) {
            order.setStatus(target);
            order.getHistories().add(OrderHistory.builder()
                    .order(order)
                    .user(admin)
                    .status(target)
                    .description("Admin từ chối yêu cầu trả hàng của khách")
                    .build());
            return OrderResponse.fromEntity(order);
        }       

        if (target == OrderStatus.RETURNED) {
            return orderLifecycleService.processReturnOrder(orderId, "Admin xác nhận chấp nhận trả hàng và nhập lại kho", admin);
        }

        if (target == OrderStatus.REFUNDED) {
            return paymentService.processRefund(orderId, order.getFinalAmount(), "Xác nhận hoàn tiền qua Admin API", admin);
        }
        // Tao ma trackingNumber khi chuyen sang SHIPPED (tu dong neu khong duoc truyen hoac rong).
        if (target == OrderStatus.SHIPPED) {
            String trackingNumber = (request != null && request.trackingNumber() != null && !request.trackingNumber().isBlank())
                    ? request.trackingNumber().trim()
                    : generateTrackingNumber();
            order.setTrackingNumber(trackingNumber);
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

        // Đơn hàng đã giao (DELIVERED) thì admin không thể thay đổi trạng thái đơn hàng nữa
        if (current == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Đơn hàng đã được giao (DELIVERED), admin không thể thay đổi trạng thái đơn hàng.");
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

            // LUỒNG ĐỔI TRẢ & HOÀN TIỀN:
            // Khi khách yêu cầu trả (RETURN_REQUESTED): Admin có thể duyệt (RETURNED) hoặc từ chối (DELIVERED)
            case RETURN_REQUESTED -> target == OrderStatus.RETURNED || target == OrderStatus.DELIVERED;
            case RETURNED -> target == OrderStatus.REFUNDED;

            default -> false;
        };

        if (!allowed) {
            throw new BusinessRuleException("Trạng thái đơn hàng không hợp lệ khi chuyển từ " + current + " sang " + target);
        }
    }
    private User resolveAdminUser(Order order) {
        try {
            Integer adminId = SecurityUtils.getCurrentUserId();
            if (adminId != null) {
                User user = userRepository.findById(adminId).orElse(null);
                if (user != null) {
                    return user;
                }
            }
        } catch (Exception ignored) {
        }
        return userRepository.findByUsername("admin").orElse(order.getUser());
    }

    private String generateTrackingNumber() {
         String prefix = "TRK" + UUID.randomUUID().toString().substring(0, 8);
         return prefix.toUpperCase();
    }
}

