package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Review;

import java.time.Instant;

@Getter
@Setter
@Builder
public class ReviewResponse {
    private Integer id;
    private Integer userId;
    private Integer productId;
    private int rating;
    private String comment;
    private Instant createdAt;

    public static ReviewResponse fromEntity(Review review) {
        if (review == null) {
            return null;
        }
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser() == null ? null : review.getUser().getId())
                .productId(review.getProduct() == null ? null : review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

