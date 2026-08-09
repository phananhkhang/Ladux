package org.akira.ladux.repository;

import java.util.List;
import java.util.Optional;

import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    @EntityGraph(attributePaths = {"brand", "category", "images", "variants", "variants.color"})
    @Override
    Optional<Product> findById(Integer id);

    @EntityGraph(attributePaths = {"brand", "category", "images", "variants", "variants.color"})
    Product findBySlug(String slug);
    
    @Query("select p.id from Product p")
    Page<Integer> findAllIds(Pageable pageable);

    @Query("select p.id from Product p where p.brand.id = :brandId")
    Page<Integer> findIdsByBrandId(@Param("brandId") Integer brandId, Pageable pageable);

    @Query("select p.id from Product p where p.category.id = :categoryId")
    Page<Integer> findIdsByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);

    @Query("select p.id from Product p where p.isActive = true")
    Page<Integer> findIdsByIsActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category", "images", "variants", "variants.color"})
    @Query("select distinct p from Product p where p.id in :ids")
    List<Product> findSummariesByIdIn(@Param("ids") List<Integer> ids);

    @EntityGraph(attributePaths = {"brand", "category", "variants", "variants.color"})
    @Query("select distinct p from Product p")
    List<Product> findAllForEmbedding();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Integer id);

    @Query("""
        SELECT p.id FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Integer> searchIds(
            @Param("search") String search,
            Pageable pageable
    );
    boolean existsByCategoryId(int id);
}
