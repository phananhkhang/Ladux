package org.akira.auratech.service;

import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderHistoryService {
    Page<OrderHistoryResponse> getAllOrderHistories(Pageable pageable);

    OrderHistoryResponse getOrderHistoryById(int id);

    Page<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId, Pageable pageable);

    Page<OrderHistoryResponse> getOrdersHistoryByUser(Integer userId, Pageable pageable);
}
