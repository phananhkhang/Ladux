package org.akira.ladux.service;

import org.akira.ladux.dto.response.user.PaymentCallbackResponse;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.enums.PaymentProvider;

import java.math.BigDecimal;

public interface PaymentAttemptService {
    void initializePayment(Order order, PaymentProvider provider, BigDecimal amount);

    PaymentCallbackResponse retryPayment(int userId, int orderId);
}

