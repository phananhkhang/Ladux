package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ReviewRequest;
import org.akira.auratech.dto.ReviewResponse;
import org.akira.auratech.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(service.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable int id) {
        return ResponseEntity.ok(service.getReviewById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getReviewsByProductId(productId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getReviewsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        return new ResponseEntity<>(service.createReview(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable int id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(service.updateReview(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReviewById(@PathVariable int id) {
        service.deleteReviewById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
