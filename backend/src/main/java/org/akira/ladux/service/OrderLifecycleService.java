package org.akira.ladux.service;

import org.akira.ladux.dto.order.response.OrderResponse;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.User;

public interface OrderLifecycleService {

    void confirmAfterSuccessfulPayment(Order order);

    void cancelOrder(Order order, String description);

    void refundOrder(Order order, String description);

    OrderResponse processReturnOrder(int orderId, String reason, User admin);
}
