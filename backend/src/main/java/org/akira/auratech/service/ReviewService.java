package org.akira.auratech.service;

import org.akira.auratech.dto.request.ReviewCreateRequest;
import org.akira.auratech.dto.request.ReviewUpdateRequest;
import org.akira.auratech.dto.response.ReviewResponse;
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
}
