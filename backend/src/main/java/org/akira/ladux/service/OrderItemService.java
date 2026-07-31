package org.akira.ladux.service;

import org.akira.ladux.dto.response.user.OrderItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderItemService {
    Page<OrderItemResponse> getAllOrderItems(Pageable pageable);

    OrderItemResponse getOrderItemById(int id);

    Page<OrderItemResponse> getOrderItemsByOrderId(int orderId, Pageable pageable);
}
