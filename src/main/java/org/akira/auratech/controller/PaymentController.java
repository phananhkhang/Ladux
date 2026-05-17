package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.PaymentRequest;
import org.akira.auratech.dto.PaymentResponse;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(service.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(service.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable int orderId) {
        return ResponseEntity.ok(service.getPaymentByOrderId(orderId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        return ResponseEntity.ok(service.getPaymentsByStatus(status));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(service.createPayment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable int id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(service.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentById(@PathVariable int id) {
        service.deletePaymentById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
