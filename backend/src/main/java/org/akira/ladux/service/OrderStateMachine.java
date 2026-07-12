package org.akira.ladux.service;

import org.akira.ladux.dto.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.response.OrderResponse;

public interface OrderStateMachine {
    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    int expirePendingOrders();
}

