package org.akira.auratech.repository;

import jakarta.persistence.LockModeType;
import org.akira.auratech.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    @EntityGraph(attributePaths = {"user"})
    @Override
    Page<Review> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Override
    Optional<Review> findById(Integer id);

    @EntityGraph(attributePaths = {"user"})
    Page<Review> findByProductId(Integer productId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Review> findByUserId(Integer userId, Pageable pageable);

    boolean existsByUserIdAndProductId(Integer userId, Integer productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"user"})
    Optional<Review> findByUserIdAndId(int userId, int reviewId);
}

