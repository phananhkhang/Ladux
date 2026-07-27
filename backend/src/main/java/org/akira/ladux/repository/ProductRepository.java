package org.akira.ladux.repository;

import java.util.Optional;

import org.akira.ladux.model.Product;
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
    @EntityGraph(attributePaths = {"brand", "category", "images"})
    @Override
    Optional<Product> findById(Integer id);

    @EntityGraph(attributePaths = {"brand", "category", "images"})
    Product findBySlug(String slug);

    @EntityGraph(attributePaths = {"brand", "category"})
    Page<Product> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    Page<Product> findByBrandId(Integer brandId, Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    Page<Product> findByCategoryId(Integer categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    Page<Product> findByIsActiveTrue(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"brand", "category"})
    @Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Product> search(
            @Param("search") String search,
            Pageable pageable
    );
    boolean existsByCategoryId(int id);

}

