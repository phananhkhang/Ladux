package org.akira.auratech.service;

import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.PaymentProvider;

import java.math.BigDecimal;

public interface PaymentAttemptService {
    void initializePayment(Order order, PaymentProvider provider, BigDecimal amount);

    PaymentCallbackResponse retryPayment(int userId, int orderId);
}

