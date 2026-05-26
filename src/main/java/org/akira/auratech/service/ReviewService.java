package org.akira.auratech.service;

import org.akira.auratech.dto.request.ReviewRequest;
import org.akira.auratech.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    Page<ReviewResponse> getAllReviews(Pageable pageable);

    ReviewResponse getReviewById(int id);

    Page<ReviewResponse> getReviewsByProductId(int productId, Pageable pageable);

    Page<ReviewResponse> getReviewsByUserId(int userId, Pageable pageable);

    ReviewResponse createReview(ReviewRequest request);

    ReviewResponse updateReview(int userId, int reviewId, ReviewRequest request);

    void deleteReviewById(int userId, int reviewId);
}
