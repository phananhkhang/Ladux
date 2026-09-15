package org.akira.ladux.catalog.infrastructure.persistence;

import org.akira.ladux.catalog.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataCategoryRepository extends JpaRepository<Category, Integer> {
}
