package org.akira.auratech.repository;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);

    List<Order> findByStatus(OrderStatus status);

    @EntityGraph(attributePaths = {"items", "items.product", "coupon"})
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Integer id);

    @Query("""
            select count(oi) > 0
            from OrderItem oi
            where oi.order.user.id = :userId
              and oi.product.id = :productId
              and oi.order.status = :status
            """)
    boolean existsOrderContainingProductWithStatus(
            @Param("userId") Integer userId,
            @Param("productId") Integer productId,
            @Param("status") OrderStatus status
    );
}

