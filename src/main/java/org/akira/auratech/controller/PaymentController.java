package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    public ResponseEntity<Page<PaymentCallbackResponse>> getAllPayments(Pageable pageable) {   // Chặn lại vì user không thể xem payment của các user khác được.
        return ResponseEntity.ok(service.getAllPayments(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentCallbackResponse> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(service.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getPaymentsByOrderId(@RequestHeader("X-User-Id") int userId, @PathVariable int orderId, Pageable pageable) {
        return ResponseEntity.ok(service.getPaymentsByOrderId(userId, orderId, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<PaymentCallbackResponse>> getPaymentsByStatus(@PathVariable PaymentStatus status, Pageable pageable) {
        return ResponseEntity.ok(service.getPaymentsByStatus(status, pageable));
    }

    @PostMapping
    public ResponseEntity<PaymentCallbackResponse> createPayment(@Valid @RequestBody PaymentCallbackRequest request) {
        return new ResponseEntity<>(service.createPayment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentCallbackResponse> updatePayment(@PathVariable int id, @Valid @RequestBody PaymentCallbackRequest request) {
        return ResponseEntity.ok(service.updatePayment(id, request));
    }
}
