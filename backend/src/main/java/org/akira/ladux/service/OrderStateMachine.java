package org.akira.ladux.service;

import org.akira.ladux.dto.request.admin.OrderStatusUpdateRequest;
import org.akira.ladux.dto.response.user.OrderResponse;

public interface OrderStateMachine {
    OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request);

    void expirePendingOrders();
}

