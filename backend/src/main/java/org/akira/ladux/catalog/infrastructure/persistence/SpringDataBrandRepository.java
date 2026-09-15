package org.akira.ladux.catalog.infrastructure.persistence;

import org.akira.ladux.catalog.domain.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataBrandRepository extends JpaRepository<Brand, Integer> {
}
