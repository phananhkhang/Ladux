package org.akira.auratech.service;

import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(int userId, int orderId);

    List<OrderResponse> getOrdersByUserId(int userId);

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    OrderResponse createOrder(int userId, OrderRequest request);

    OrderResponse updateOrderStatus(int userId, int orderId, OrderStatusUpdateRequest request);

    PaymentCallbackResponse retryPayment(int userid, int orderId);
}
