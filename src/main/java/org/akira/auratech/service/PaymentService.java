package org.akira.auratech.service;

import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    List<PaymentCallbackResponse> getAllPayments();

    PaymentCallbackResponse getPaymentById(int id);

    List<PaymentCallbackResponse> getPaymentsByOrderId(int orderId);

    List<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status);

    PaymentCallbackResponse createPayment(PaymentCallbackRequest request);

    PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request);

    void deletePaymentById(int id);
}
