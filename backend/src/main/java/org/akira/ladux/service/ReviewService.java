package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.ReviewCreateRequest;
import org.akira.ladux.dto.catalog.request.ReviewUpdateRequest;
import org.akira.ladux.dto.catalog.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    Page<ReviewResponse> getAllReviews(Pageable pageable);

    ReviewResponse getReviewById(int id);

    Page<ReviewResponse> getReviewsByProductId(int productId, Pageable pageable);

    Page<ReviewResponse> getReviewsByUserId(int userId, Pageable pageable);

    ReviewResponse createReview(int userId, ReviewCreateRequest request);

    ReviewResponse updateReview(int userId, int reviewId, ReviewUpdateRequest request);

    void deleteReviewById(int userId, int reviewId);

    Page<ReviewResponse> findReviewByNameUser(String name, Pageable pageable);
}
