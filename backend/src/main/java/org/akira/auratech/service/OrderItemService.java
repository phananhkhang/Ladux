package org.akira.auratech.service;

import org.akira.auratech.dto.response.OrderItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderItemService {
    Page<OrderItemResponse> getAllOrderItems(Pageable pageable);

    OrderItemResponse getOrderItemById(int id);

    Page<OrderItemResponse> getOrderItemsByOrderId(int orderId, Pageable pageable);
}
