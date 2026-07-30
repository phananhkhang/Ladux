package org.akira.ladux.service;

import org.akira.ladux.dto.request.OrderRequest;
import org.akira.ladux.dto.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.response.OrderResponse;
import org.akira.ladux.dto.response.PaymentCallbackResponse;
import org.akira.ladux.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse getOrderById(int userId, int orderId);

    Page<OrderResponse> getOrdersByUserId(int userId, Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);

    OrderResponse createOrder(int userId, OrderRequest request);

    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    PaymentCallbackResponse retryPayment(int userid, int orderId);

    void expirePendingOrders();
}
