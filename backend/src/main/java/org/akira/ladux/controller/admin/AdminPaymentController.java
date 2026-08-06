package org.akira.ladux.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.request.PaymentCallbackRequest;
import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.model.enums.PaymentStatus;
import org.akira.ladux.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService service;
    private final org.akira.ladux.repository.UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentCallbackResponse>> getAllPayments(Pageable pageable) {
        return ResponseEntity.ok(service.getAllPayments(pageable));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentCallbackResponse>> getPaymentsByOrderId(
            @PathVariable int orderId, Pageable pageable) {
        return ResponseEntity.ok(service.getPaymentsByOrderId(orderId, pageable));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentCallbackResponse> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(service.getPaymentById(id));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentCallbackResponse>> getPaymentsByStatus(
            @PathVariable PaymentStatus status, Pageable pageable) {
        return ResponseEntity.ok(service.getPaymentsByStatus(status, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentCallbackResponse> updatePayment(
            @PathVariable int id, @Valid @RequestBody PaymentCallbackRequest request) {
        return ResponseEntity.ok(service.updatePayment(id, request));
    }

    @PostMapping("/order/{orderId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.akira.ladux.dto.order.response.OrderResponse> processRefund(
            @PathVariable int orderId,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.akira.ladux.model.UserPrincipal principal
    ) {
        java.math.BigDecimal amount = (body != null && body.get("amount") != null)
                ? new java.math.BigDecimal(body.get("amount").toString())
                : null;
        String reason = (body != null && body.get("reason") != null)
                ? body.get("reason").toString()
                : "Hoàn tiền bởi Admin";

        org.akira.ladux.model.User admin = userRepository.findById(principal.getId())
                .orElseThrow(() -> new org.akira.ladux.exception.ResourceNotFoundException("Admin user not found"));

        return ResponseEntity.ok(service.processRefund(orderId, amount, reason, admin));
    }
}