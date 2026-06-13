package org.akira.auratech.repository;

import org.akira.auratech.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @EntityGraph(attributePaths = {"order", "product"})
    @Override
    Page<OrderItem> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"order", "product"})
    @Override
    Optional<OrderItem> findById(Integer id);

    @EntityGraph(attributePaths = {"order", "product"})
    Page<OrderItem> findByOrderId(Integer orderId, Pageable pageable);
}

