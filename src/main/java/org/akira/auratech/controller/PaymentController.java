package org.akira.auratech.controller;

import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    PaymentService service;

    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable int id) {
        return service.getPaymentById(id);
    }

    @GetMapping("/order/{orderId}")
    public Payment getPaymentByOrderId(@PathVariable int orderId) {
        return service.getPaymentByOrderId(orderId);
    }

    @GetMapping("/status/{status}")
    public List<Payment> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        return service.getPaymentsByStatus(status);
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return service.createPayment(payment);
    }

    @PutMapping
    public Payment updatePayment(@RequestBody Payment payment) {
        return service.updatePayment(payment);
    }

    @DeleteMapping("/{id}")
    public void deletePaymentById(@PathVariable int id) {
        service.deletePaymentById(id);
    }
}

