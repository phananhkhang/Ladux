package org.akira.auratech.repository;

import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Payment findByOrderId(Integer orderId);

    List<Payment> findByStatus(PaymentStatus status);
}

