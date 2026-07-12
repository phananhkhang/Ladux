package org.akira.ladux.repository;

import org.akira.ladux.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Category findByName(String name);

    Category findBySlug(String slug);

    Page<Category> findByParentIsNull(Pageable pageable);

    boolean existsByParentId(int id);
}

