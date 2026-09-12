package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.ReviewCreateRequest;
import org.akira.ladux.dto.catalog.request.ReviewUpdateRequest;
import org.akira.ladux.dto.catalog.response.ReviewResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    PageResponse<ReviewResponse> getAllReviews(Pageable pageable);

    ReviewResponse getReviewById(int id);

    PageResponse<ReviewResponse> getReviewsByProductId(int productId, Pageable pageable);

    PageResponse<ReviewResponse> getReviewsByUserId(int userId, Pageable pageable);

    ReviewResponse createReview(int userId, ReviewCreateRequest request);

    ReviewResponse updateReview(int userId, int reviewId, ReviewUpdateRequest request);

    void deleteReviewById(int userId, int reviewId);

    PageResponse<ReviewResponse> findReviewByNameUser(String name, Pageable pageable);
}
