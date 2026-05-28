package org.akira.auratech.repository;

import org.akira.auratech.model.OrderHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Integer> {
    @EntityGraph(attributePaths = {"order"})
    @Override
    List<OrderHistory> findAll();

    @EntityGraph(attributePaths = {"order"})
    @Override
    java.util.Optional<OrderHistory> findById(Integer id);

    @EntityGraph(attributePaths = {"order"})
    List<OrderHistory> findByOrderId(Integer orderId);
}

