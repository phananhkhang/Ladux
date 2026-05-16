package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ReviewRequest;
import org.akira.auratech.dto.ReviewResponse;
import org.akira.auratech.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @GetMapping
    public List<ReviewResponse> getAllReviews() {
        return service.getAllReviews();
    }

    @GetMapping("/{id}")
    public ReviewResponse getReviewById(@PathVariable int id) {
        return service.getReviewById(id);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> getReviewsByProductId(@PathVariable int productId) {
        return service.getReviewsByProductId(productId);
    }

    @GetMapping("/user/{userId}")
    public List<ReviewResponse> getReviewsByUserId(@PathVariable int userId) {
        return service.getReviewsByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(service.createReview(request));
    }

    @PutMapping("/{id}")
    public ReviewResponse updateReview(@PathVariable int id, @RequestBody ReviewRequest request) {
        return service.updateReview(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteReviewById(@PathVariable int id) {
        service.deleteReviewById(id);
    }
}
