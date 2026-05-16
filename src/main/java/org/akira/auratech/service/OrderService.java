package org.akira.auratech.service;

import org.akira.auratech.dto.OrderRequest;
import org.akira.auratech.dto.OrderResponse;
import org.akira.auratech.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(int id);

    List<OrderResponse> getOrdersByUserId(int userId);

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    OrderResponse createOrder(OrderRequest request);

    OrderResponse updateOrder(int id, OrderRequest request);

    void deleteOrderById(int id);
}
