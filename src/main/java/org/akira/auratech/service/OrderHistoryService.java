package org.akira.auratech.service;

import org.akira.auratech.dto.OrderHistoryRequest;
import org.akira.auratech.dto.OrderHistoryResponse;

import java.util.List;

public interface OrderHistoryService {
    List<OrderHistoryResponse> getAllOrderHistories();

    OrderHistoryResponse getOrderHistoryById(int id);

    List<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId);

    OrderHistoryResponse createOrderHistory(OrderHistoryRequest request);

    OrderHistoryResponse updateOrderHistory(int id, OrderHistoryRequest request);

    void deleteOrderHistoryById(int id);
}
