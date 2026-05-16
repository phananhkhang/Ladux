package org.akira.auratech.service;

import org.akira.auratech.dto.ReviewRequest;
import org.akira.auratech.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> getAllReviews();

    ReviewResponse getReviewById(int id);

    List<ReviewResponse> getReviewsByProductId(int productId);

    List<ReviewResponse> getReviewsByUserId(int userId);

    ReviewResponse createReview(ReviewRequest request);

    ReviewResponse updateReview(int id, ReviewRequest request);

    void deleteReviewById(int id);
}
