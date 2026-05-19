package org.akira.auratech.service;

import org.akira.auratech.dto.response.OrderHistoryResponse;

import java.util.List;

public interface OrderHistoryService {
    List<OrderHistoryResponse> getAllOrderHistories();

    OrderHistoryResponse getOrderHistoryById(int id);

    List<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId);
}
