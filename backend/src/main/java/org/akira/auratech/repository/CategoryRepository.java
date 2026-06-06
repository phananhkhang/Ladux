package org.akira.auratech.repository;

import org.akira.auratech.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Category findByName(String name);

    Category findBySlug(String slug);

    List<Category> findByParentIsNull();

    boolean existsByParentId(int id);
}

