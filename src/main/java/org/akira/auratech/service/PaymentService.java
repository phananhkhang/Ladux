package org.akira.auratech.service;

import org.akira.auratech.dto.PaymentRequest;
import org.akira.auratech.dto.PaymentResponse;
import org.akira.auratech.model.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    List<PaymentResponse> getAllPayments();

    PaymentResponse getPaymentById(int id);

    PaymentResponse getPaymentByOrderId(int orderId);

    List<PaymentResponse> getPaymentsByStatus(PaymentStatus status);

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse updatePayment(int id, PaymentRequest request);

    void deletePaymentById(int id);
}
