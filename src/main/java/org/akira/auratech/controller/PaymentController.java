package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.PaymentRequest;
import org.akira.auratech.dto.PaymentResponse;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{id}")
    public PaymentResponse getPaymentById(@PathVariable int id) {
        return service.getPaymentById(id);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(@PathVariable int orderId) {
        return service.getPaymentByOrderId(orderId);
    }

    @GetMapping("/status/{status}")
    public List<PaymentResponse> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        return service.getPaymentsByStatus(status);
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(service.createPayment(request));
    }

    @PutMapping("/{id}")
    public PaymentResponse updatePayment(@PathVariable int id, @RequestBody PaymentRequest request) {
        return service.updatePayment(id, request);
    }

    @DeleteMapping("/{id}")
    public void deletePaymentById(@PathVariable int id) {
        service.deletePaymentById(id);
    }
}
