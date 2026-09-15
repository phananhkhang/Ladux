package org.akira.ladux.catalog.infrastructure.persistence;

import java.util.Optional;

import org.akira.ladux.catalog.domain.model.ProductVariant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    @EntityGraph(attributePaths = {"product", "color"})
    @Override
    Optional<ProductVariant> findById(Integer id);
}
