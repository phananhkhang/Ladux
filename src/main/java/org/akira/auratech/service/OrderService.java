package org.akira.auratech.service;

import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(int id);

    List<OrderResponse> getOrdersByUserId(int userId);

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    OrderResponse createOrder(OrderRequest request);

    OrderResponse updateOrderStatus(int id, OrderStatusUpdateRequest request);

    PaymentCallbackResponse retryPayment(int id);

    void deleteOrderById(int id);
}
