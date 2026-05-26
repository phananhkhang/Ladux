package org.akira.auratech.repository;

import jakarta.persistence.LockModeType;
import org.akira.auratech.model.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    @EntityGraph(attributePaths = {"items", "items.product", "items.product.brand", "items.product.category"})
    Cart findByUserId(Integer userId);

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.brand", "items.product.category"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cart c where c.user.id = :userId")
    Optional<Cart> findByUserIdForUpdate(@Param("userId") Integer userId);
}

