package org.akira.ladux.service;

import org.akira.ladux.dto.request.user.ReviewCreateRequest;
import org.akira.ladux.dto.request.user.ReviewUpdateRequest;
import org.akira.ladux.dto.response.common.ReviewResponse;
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

    boolean validateReviewRating(int rating);
}
