package org.akira.auratech.service;

import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    List<Payment> getAllPayments();

    Payment getPaymentById(int id);

    Payment getPaymentByOrderId(int orderId);

    List<Payment> getPaymentsByStatus(PaymentStatus status);

    Payment createPayment(Payment payment);

    Payment updatePayment(Payment payment);

    void deletePaymentById(int id);
}
