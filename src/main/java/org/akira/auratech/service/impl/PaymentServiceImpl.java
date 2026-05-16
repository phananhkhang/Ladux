package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.PaymentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository repo;

    @Override
    public List<Payment> getAllPayments() {
        return repo.findAll();
    }

    @Override
    public Payment getPaymentById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Payment getPaymentByOrderId(int orderId) {
        return repo.findByOrderId(orderId);
    }

    @Override
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return repo.findByStatus(status);
    }

    @Override
    public Payment createPayment(Payment payment) {
        return repo.save(payment);
    }

    @Override
    public Payment updatePayment(Payment payment) {
        return repo.save(payment);
    }

    @Override
    public void deletePaymentById(int id) {
        repo.deleteById(id);
    }
}

