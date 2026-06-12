package org.akira.auratech.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ReviewCreateRequest;
import org.akira.auratech.dto.request.ReviewUpdateRequest;
import org.akira.auratech.dto.response.ReviewResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(Pageable pageable) {
        return ResponseEntity.ok(service.getAllReviews(pageable));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByUserId(@PathVariable int userId, Pageable pageable) {
        return ResponseEntity.ok(service.getReviewsByUserId(userId, pageable));
    }
}
