package org.akira.ladux.service;

import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.enums.PaymentProvider;

import java.math.BigDecimal;

public interface PaymentAttemptService {
    void initializePayment(Order order, PaymentProvider provider, BigDecimal amount);

    PaymentCallbackResponse retryPayment(int userId, int orderId, String clientIp);
}

