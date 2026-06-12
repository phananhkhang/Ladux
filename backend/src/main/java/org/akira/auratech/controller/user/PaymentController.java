package org.akira.auratech.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.request.PaymentCreateRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    /** Xem danh sách payment của chính mình */
    @GetMapping("/my")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPayments(principal.getId(), pageable));
    }

    /** Xem payment theo đơn hàng của chính mình */
    @GetMapping("/my/order/{orderId}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPaymentsByOrderId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int orderId,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPaymentsByOrderId(principal.getId(), orderId, pageable));
    }

    /** Xem payment của chính mình theo trạng thái */
    @GetMapping("/my/status/{status}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPaymentsByStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable PaymentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPaymentsByStatus(principal.getId(), status, pageable));
    }

    /** Tạo payment mới */
    @PostMapping
    public ResponseEntity<PaymentCallbackResponse> createPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentCreateRequest request) {
        return new ResponseEntity<>(service.createPayment(principal.getId(), request), HttpStatus.CREATED);
    }
}