package org.akira.auratech.repository;

import org.akira.auratech.model.OrderHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Integer> {
    @EntityGraph(attributePaths = {"order"})
    @Override
    Page<OrderHistory> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"order"})
    @Override
    Optional<OrderHistory> findById(Integer id);

    @EntityGraph(attributePaths = {"order"})
    Page<OrderHistory> findByOrderId(Integer orderId, Pageable pageable);
}

