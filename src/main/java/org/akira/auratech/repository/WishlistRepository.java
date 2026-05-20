package org.akira.auratech.repository;

import org.akira.auratech.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByUserId(Integer userId);

    List<Wishlist> findByProductId(Integer productId);

    boolean existsByUserIdAndProductId(int userId, int productId);

    Wishlist findByUserIdAndProductId(int userId, int productId);
}

