package org.akira.ladux.service;

import org.akira.ladux.dto.response.user.OrderHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderHistoryService {
    Page<OrderHistoryResponse> getAllOrderHistories(Pageable pageable);

    OrderHistoryResponse getOrderHistoryById(int id);

    Page<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId, Pageable pageable);

    Page<OrderHistoryResponse> getOrdersHistoryByUser(Integer userId, Pageable pageable);
}
