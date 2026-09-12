package org.akira.ladux.service;

import org.akira.ladux.dto.order.response.OrderItemResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface OrderItemService {
    PageResponse<OrderItemResponse> getAllOrderItems(Pageable pageable);

    OrderItemResponse getOrderItemById(int id);

    PageResponse<OrderItemResponse> getOrderItemsByOrderId(int orderId, Pageable pageable);
}
