package org.akira.ladux.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.system.PaymentCallbackRequest;
import org.akira.ladux.dto.response.user.PaymentCallbackResponse;
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

}