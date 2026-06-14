package org.akira.auratech.repository;

import org.akira.auratech.model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {

    @EntityGraph(attributePaths = {"product", "createdBy"})
    Page<StockMovement> findByProductId(Integer productId, Pageable pageable);

    @EntityGraph(attributePaths = {"product", "createdBy"})
    Page<StockMovement> findAll(Pageable pageable);
}
