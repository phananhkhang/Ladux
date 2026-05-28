package org.akira.auratech.repository;

import org.akira.auratech.model.Wishlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    @EntityGraph(attributePaths = {"product", "product.brand", "product.category", "product.images"})
    List<Wishlist> findByUserId(Integer userId);

    @EntityGraph(attributePaths = {"user", "product", "product.brand", "product.category"})
    List<Wishlist> findByProductId(Integer productId);

    boolean existsByUserIdAndProductId(int userId, int productId);

    @EntityGraph(attributePaths = {"product", "product.brand", "product.category", "product.images"})
    Wishlist findByUserIdAndProductId(int userId, int productId);
}

