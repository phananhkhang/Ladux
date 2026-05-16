package org.akira.auratech.service;

import org.akira.auratech.dto.OrderItemRequest;
import org.akira.auratech.dto.OrderItemResponse;

import java.util.List;

public interface OrderItemService {
    List<OrderItemResponse> getAllOrderItems();

    OrderItemResponse getOrderItemById(int id);

    List<OrderItemResponse> getOrderItemsByOrderId(int orderId);

    OrderItemResponse createOrderItem(OrderItemRequest request);

    OrderItemResponse updateOrderItem(int id, OrderItemRequest request);

    void deleteOrderItemById(int id);
}
