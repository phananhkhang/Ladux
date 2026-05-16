package org.akira.auratech.controller;

import org.akira.auratech.model.Review;
import org.akira.auratech.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    ReviewService service;

    @GetMapping("/all")
    public List<Review> getAllReviews() {
        return service.getAllReviews();
    }

    @GetMapping("/{id}")
    public Review getReviewById(@PathVariable int id) {
        return service.getReviewById(id);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getReviewsByProductId(@PathVariable int productId) {
        return service.getReviewsByProductId(productId);
    }

    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUserId(@PathVariable int userId) {
        return service.getReviewsByUserId(userId);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return service.createReview(review);
    }

    @PutMapping
    public Review updateReview(@RequestBody Review review) {
        return service.updateReview(review);
    }

    @DeleteMapping("/{id}")
    public void deleteReviewById(@PathVariable int id) {
        service.deleteReviewById(id);
    }
}

