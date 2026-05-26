package org.akira.auratech.repository;

import jakarta.persistence.LockModeType;
import org.akira.auratech.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Page<Review> findByProductId(Integer productId, Pageable pageable);

    Page<Review> findByUserId(Integer userId, Pageable pageable);

    boolean existsByUserIdAndProductId(Integer userId, Integer productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Review> findByUserIdAndId(int userId, int reviewId);
}

