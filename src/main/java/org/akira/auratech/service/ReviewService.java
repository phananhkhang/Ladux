package org.akira.auratech.service;

import org.akira.auratech.model.Review;

import java.util.List;

public interface ReviewService {
    List<Review> getAllReviews();

    Review getReviewById(int id);

    List<Review> getReviewsByProductId(int productId);

    List<Review> getReviewsByUserId(int userId);

    Review createReview(Review review);

    Review updateReview(Review review);

    void deleteReviewById(int id);
}
