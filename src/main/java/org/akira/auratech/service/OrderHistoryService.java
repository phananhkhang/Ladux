package org.akira.auratech.service;

import org.akira.auratech.model.OrderHistory;

import java.util.List;

public interface OrderHistoryService {
    List<OrderHistory> getAllOrderHistories();

    OrderHistory getOrderHistoryById(int id);

    List<OrderHistory> getOrderHistoriesByOrderId(int orderId);

    OrderHistory createOrderHistory(OrderHistory history);

    OrderHistory updateOrderHistory(OrderHistory history);

    void deleteOrderHistoryById(int id);
}
