package org.akira.ladux.repository;

import jakarta.persistence.LockModeType;
import org.akira.ladux.model.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    @EntityGraph(attributePaths = {"items", "items.product", "items.product.brand", "items.product.category"})
    Cart findByUserId(Integer userId);

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.brand", "items.product.category"})
    @Lock(LockModeType.PESSIMISTIC_WRITE) // Cái này ngon khi đọc dữ liệu lên để sửa, xóa, nếu chỉ đọc thông thường thì không Lock cũng được
    @Query("select c from Cart c where c.user.id = :userId")
    Optional<Cart> findByUserIdForUpdate(@Param("userId") Integer userId);

}

