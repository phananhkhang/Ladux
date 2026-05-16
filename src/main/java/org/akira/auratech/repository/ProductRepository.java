package org.akira.auratech.repository;

import org.akira.auratech.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Product findBySlug(String slug);

    Product findBySku(String sku);

    List<Product> findByBrandId(Integer brandId);

    List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByIsActiveTrue();
}

