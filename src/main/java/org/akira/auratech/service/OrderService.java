package org.akira.auratech.service;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();

    Order getOrderById(int id);

    List<Order> getOrdersByUserId(int userId);

    List<Order> getOrdersByStatus(OrderStatus status);

    Order createOrder(Order order);

    Order updateOrder(Order order);

    void deleteOrderById(int id);
}
