package org.akira.auratech.service;

import org.akira.auratech.dto.request.ReviewRequest;
import org.akira.auratech.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> getAllReviews();

    ReviewResponse getReviewById(int id);

    List<ReviewResponse> getReviewsByProductId(int productId);

    List<ReviewResponse> getReviewsByUserId(int userId);

    ReviewResponse createReview(ReviewRequest request);

    ReviewResponse updateReview(int userId, int reviewId, ReviewRequest request);

    void deleteReviewById(int userId, int reviewId);
}
