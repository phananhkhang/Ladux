package org.akira.ladux.repository;

import org.akira.ladux.model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {

    @EntityGraph(attributePaths = {"productVariant", "createdBy"})
    Page<StockMovement> findByProductVariantId(Integer productVariantId, Pageable pageable);

    @EntityGraph(attributePaths = {"productVariant", "createdBy"})
    Page<StockMovement> findAll(Pageable pageable);
}
