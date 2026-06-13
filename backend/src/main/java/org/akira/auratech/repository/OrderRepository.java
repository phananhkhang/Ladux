package org.akira.auratech.repository;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    Page<Order> findByUserId(Integer userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "coupon"})
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "coupon"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithItemsByIdForUpdate(@Param("id") Integer id);

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

    Optional<Order> findByUserIdAndId(int userId, int orderId);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "coupon"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findOwnedWithItemsForUpdate(@Param("userId") int userId, @Param("orderId") int orderId);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "coupon"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select o
            from Order o
            where o.status = :status
              and o.paymentExpiresAt is not null
              and o.paymentExpiresAt <= :now
            """)
    List<Order> findExpiredOrdersForUpdate(@Param("status") OrderStatus status, @Param("now") Instant now);
}

