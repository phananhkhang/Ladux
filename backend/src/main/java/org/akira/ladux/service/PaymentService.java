package org.akira.ladux.service;

import org.akira.ladux.dto.request.PaymentCallbackRequest;
import org.akira.ladux.dto.request.PaymentCreateRequest;
import org.akira.ladux.dto.response.PaymentCallbackResponse;
import org.akira.ladux.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    // ==================== ADMIN ====================

    Page<PaymentCallbackResponse> getAllPayments(Pageable pageable);

    PaymentCallbackResponse getPaymentById(int id);

    /** Admin xem payment theo orderId (không kiểm tra user) */
    Page<PaymentCallbackResponse> getPaymentsByOrderId(int orderId, Pageable pageable);

    Page<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable);

    PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request);


    // ==================== USER ====================

    /** User xem danh sách payment của chính mình */
    Page<PaymentCallbackResponse> getMyPayments(int userId, Pageable pageable);

    /** User xem payment theo orderId của chính mình */
    Page<PaymentCallbackResponse> getMyPaymentsByOrderId(int userId, int orderId, Pageable pageable);

    /** User xem payment theo trạng thái của chính mình */
    Page<PaymentCallbackResponse> getMyPaymentsByStatus(int userId, PaymentStatus status, Pageable pageable);

    /** User tạo payment mới */
    PaymentCallbackResponse createPayment(int userId, PaymentCreateRequest request);
}