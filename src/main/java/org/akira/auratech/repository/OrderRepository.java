package org.akira.auratech.repository;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);

    List<Order> findByStatus(OrderStatus status);
}

