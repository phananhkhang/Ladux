package org.akira.ladux.service;

import org.akira.ladux.dto.order.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.order.response.OrderResponse;

public interface OrderStateMachine {
    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    void expirePendingOrders();
}

