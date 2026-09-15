package org.akira.ladux.catalog.infrastructure.persistence;

import java.util.List;
import java.util.Optional;

import org.akira.ladux.catalog.domain.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataProductRepository extends JpaRepository<Product, Integer> {
    @EntityGraph(attributePaths = {"brand", "category", "images", "variants", "variants.color"})
    @Override
    Optional<Product> findById(Integer id);

    @Query("""
            select p.id from Product p
            where (:text is null or lower(p.name) like lower(concat('%', :text, '%')))
              and (:brandId is null or p.brand.id = :brandId)
              and (:categoryId is null or p.category.id = :categoryId)
            """)
    Page<Integer> findIds(
            @Param("text") String text,
            @Param("brandId") Integer brandId,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category", "images", "variants", "variants.color"})
    @Query("select distinct p from Product p where p.id in :ids")
    List<Product> findDetailsByIdIn(@Param("ids") List<Integer> ids);

}
