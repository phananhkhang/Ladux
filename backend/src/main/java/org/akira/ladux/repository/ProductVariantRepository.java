package org.akira.ladux.repository;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.akira.ladux.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    boolean existsBySku(String candidate);

    @Query("UPDATE ProductVariant p SET p.stockQuantity = p.stockQuantity - :qty " +
            "WHERE p.id = :id AND p.stockQuantity >= :qty")
    @Modifying
    int deductStockAtomically(@NotNull(message = "ProductId khong duoc de trong") @Positive(message = "ProductId phai la so duong") Integer integer,  Integer quantity);

    boolean existsByColorId(int id);
}
