package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @GetMapping
    public ResponseEntity<List<PaymentCallbackResponse>> getAllPayments() {
        return ResponseEntity.ok(service.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentCallbackResponse> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(service.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentCallbackResponse>> getPaymentsByOrderId(@PathVariable int orderId) {
        return ResponseEntity.ok(service.getPaymentsByOrderId(orderId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentCallbackResponse>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        return ResponseEntity.ok(service.getPaymentsByStatus(status));
    }

    @PostMapping
    public ResponseEntity<PaymentCallbackResponse> createPayment(@Valid @RequestBody PaymentCallbackRequest request) {
        return new ResponseEntity<>(service.createPayment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentCallbackResponse> updatePayment(@PathVariable int id, @Valid @RequestBody PaymentCallbackRequest request) {
        return ResponseEntity.ok(service.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentById(@PathVariable int id) {
        service.deletePaymentById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
