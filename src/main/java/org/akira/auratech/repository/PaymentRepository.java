package org.akira.auratech.repository;

import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    @EntityGraph(attributePaths = {"order"})
    @Override
    Page<Payment> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"order"})
    List<Payment> findByOrderIdOrderByCreatedAtDesc(Integer orderId);

    @EntityGraph(attributePaths = {"order"})
    Page<Payment> findByOrderId(Integer orderId, Pageable pageable);

    @EntityGraph(attributePaths = {"order"})
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(Integer orderId);

    @EntityGraph(attributePaths = {"order"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"order"})
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}

