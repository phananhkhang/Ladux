package org.akira.ladux.repository;

import org.akira.ladux.model.Order;
import org.akira.ladux.model.enums.OrderStatus;
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

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    Page<Order> findAll(Pageable pageable);

    // Lấy page ID đơn giản, KHÔNG join collection — tránh MultipleBagFetchException với Pageable
    @Query("select o.id from Order o where o.user.id = :userId")
    Page<Integer> findIdsByUserId(@Param("userId") Integer userId, Pageable pageable);

    // Fetch đầy đủ items + product + payments cho danh sách IDs đã biết
    @EntityGraph(attributePaths = {"user", "coupon", "payments", "items", "items.product", "items.productVariant"})
    @Query("select o from Order o where o.id in :ids")
    List<Order> findByIdIn(@Param("ids") List<Integer> ids);

    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items", "items.productVariant", "coupon"})
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"user", "coupon", "payments"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"user", "items", "items.productVariant", "coupon"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findWithItemsByIdForUpdate(@Param("id") Integer id);

    @Query("""
            select count(oi) > 0
            from OrderItem oi
            where oi.order.user.id = :userId
              and oi.productVariant.product.id = :productId
              and oi.order.status = :status
            """)
    boolean existsOrderContainingProductWithStatus(
            @Param("userId") Integer userId,
            @Param("productId") Integer productId,
            @Param("status") OrderStatus status
    );

    Optional<Order> findByUserIdAndId(int userId, int orderId);

    @EntityGraph(attributePaths = {"user", "items", "items.productVariant", "coupon"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findOwnedWithItemsForUpdate(@Param("userId") int userId, @Param("orderId") int orderId);

    @EntityGraph(attributePaths = {"user", "items", "items.productVariant", "coupon"})
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
