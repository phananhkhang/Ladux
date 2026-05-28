package org.akira.auratech.service;

import org.akira.auratech.dto.request.PaymentCreateRequest;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {
    Page<PaymentCallbackResponse> getAllPayments(Pageable pageable);

    PaymentCallbackResponse getPaymentById(int id);

    Page<PaymentCallbackResponse> getPaymentsByOrderId(int userId, int orderId, Pageable pageable);

    Page<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable);

    PaymentCallbackResponse createPayment(int userId, PaymentCreateRequest request);

    PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request);
}
