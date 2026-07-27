package org.akira.ladux.repository;

import org.akira.ladux.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByCartId(Integer cartId);

    List<CartItem> findByProductId(Integer productId);

    void deleteByProductVariantId(Integer variantId);
}

