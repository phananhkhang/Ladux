package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ReviewRequest;
import org.akira.auratech.dto.response.ReviewResponse;
import org.akira.auratech.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(Pageable pageable) {
        return ResponseEntity.ok(service.getAllReviews(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable int id) {
        return ResponseEntity.ok(service.getReviewById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByProductId(@PathVariable int productId, Pageable pageable) {
        return ResponseEntity.ok(service.getReviewsByProductId(productId, pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByUserId(@PathVariable int userId, Pageable pageable) {
        return ResponseEntity.ok(service.getReviewsByUserId(userId, pageable));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        return new ResponseEntity<>(service.createReview(request), HttpStatus.CREATED);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(@RequestHeader("X-User-Id") int userId, @PathVariable int reviewId, @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(service.updateReview(userId, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReviewById(@RequestHeader("X-User-Id") int userId, @PathVariable int reviewId) {
        service.deleteReviewById(userId, reviewId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
