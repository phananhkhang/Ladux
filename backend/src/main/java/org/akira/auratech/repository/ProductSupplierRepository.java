package org.akira.auratech.repository;

import java.util.List;

import org.akira.auratech.model.ProductSupplier;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductSupplierRepository extends JpaRepository<ProductSupplier, Long> {

    @EntityGraph(attributePaths = {"product", "supplier"})
    List<ProductSupplier> findByProductId(Integer productId);

    @EntityGraph(attributePaths = {"product", "supplier"})
    List<ProductSupplier> findBySupplierId(Integer supplierId);

    boolean existsByProductIdAndSupplierId(Integer productId, Integer supplierId);
}
