package org.akira.auratech.service;

import org.akira.auratech.dto.response.OrderItemResponse;

import java.util.List;

public interface OrderItemService {
    List<OrderItemResponse> getAllOrderItems();

    OrderItemResponse getOrderItemById(int id);

    List<OrderItemResponse> getOrderItemsByOrderId(int orderId);
}
