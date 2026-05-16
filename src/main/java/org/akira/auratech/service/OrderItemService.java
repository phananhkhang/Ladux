package org.akira.auratech.service;

import org.akira.auratech.model.OrderItem;

import java.util.List;

public interface OrderItemService {
    List<OrderItem> getAllOrderItems();

    OrderItem getOrderItemById(int id);

    List<OrderItem> getOrderItemsByOrderId(int orderId);

    OrderItem createOrderItem(OrderItem orderItem);

    OrderItem updateOrderItem(OrderItem orderItem);

    void deleteOrderItemById(int id);
}
