package org.akira.ladux.controller.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.request.PaymentCreateRequest;
import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.model.enums.PaymentStatus;
import org.akira.ladux.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    @GetMapping("/my")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPayments(principal.getId(), pageable));
    }

    @GetMapping("/my/order/{orderId}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPaymentsByOrderId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int orderId,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPaymentsByOrderId(principal.getId(), orderId, pageable));
    }

    @GetMapping("/my/status/{status}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getMyPaymentsByStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable PaymentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyPaymentsByStatus(principal.getId(), status, pageable));
    }

    @PostMapping
    public ResponseEntity<PaymentCallbackResponse> createPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentCreateRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = org.akira.ladux.utils.ClientIpUtils.getClientIp(httpRequest);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createPayment(
                        principal.getId(),
                        request,
                        clientIp
                ));
    }

    @GetMapping("/my/txn-ref/{merchantTxnRef}")
    public ResponseEntity<PaymentCallbackResponse> getMyPaymentByMerchantTxnRef(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String merchantTxnRef
    ) {
        return ResponseEntity.ok(
                service.getMyPaymentByMerchantTxnRef(
                        principal.getId(),
                        merchantTxnRef
                )
        );
    }
}