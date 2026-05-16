package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Review;
import org.akira.auratech.repository.ReviewRepository;
import org.akira.auratech.service.ReviewService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository repo;

    @Override
    public List<Review> getAllReviews() {
        return repo.findAll();
    }

    @Override
    public Review getReviewById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Review> getReviewsByProductId(int productId) {
        return repo.findByProductId(productId);
    }

    @Override
    public List<Review> getReviewsByUserId(int userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public Review createReview(Review review) {
        return repo.save(review);
    }

    @Override
    public Review updateReview(Review review) {
        return repo.save(review);
    }

    @Override
    public void deleteReviewById(int id) {
        repo.deleteById(id);
    }
}

