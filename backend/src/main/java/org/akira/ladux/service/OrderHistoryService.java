package org.akira.ladux.service;

import org.akira.ladux.dto.order.response.OrderHistoryResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface OrderHistoryService {
    PageResponse<OrderHistoryResponse> getAllOrderHistories(Pageable pageable);

    OrderHistoryResponse getOrderHistoryById(int id);

    PageResponse<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId, Pageable pageable);

    PageResponse<OrderHistoryResponse> getOrdersHistoryByUser(Integer userId, Pageable pageable);
}
