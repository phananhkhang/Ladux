package org.akira.auratech.service;

import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;

public interface OrderStateMachine {
    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    int expirePendingOrders();
}

