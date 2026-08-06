package org.akira.ladux.service;

import org.akira.ladux.dto.order.request.OrderRequest;
import org.akira.ladux.dto.order.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.order.response.OrderResponse;
import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse getOrderById(int userId, int orderId);

    OrderResponse getOrderByIdForAdmin(int orderId);

    Page<OrderResponse> getOrdersByUserId(int userId, Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);

    OrderResponse createOrder(int userId, OrderRequest request);

    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    PaymentCallbackResponse retryPayment(int userId, int orderId, String clientIp);

    void expirePendingOrders();

    void cancelOrder(Integer orderId);

    OrderResponse requestReturn(int userId, int orderId, String reason);
}
