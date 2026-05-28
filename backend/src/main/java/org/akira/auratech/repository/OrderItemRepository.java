package org.akira.auratech.repository;

import org.akira.auratech.model.OrderItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @EntityGraph(attributePaths = {"order", "product"})
    @Override
    List<OrderItem> findAll();

    @EntityGraph(attributePaths = {"order", "product"})
    @Override
    java.util.Optional<OrderItem> findById(Integer id);

    @EntityGraph(attributePaths = {"order", "product"})
    List<OrderItem> findByOrderId(Integer orderId);
}

