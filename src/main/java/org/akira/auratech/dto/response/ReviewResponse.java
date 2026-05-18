package org.akira.auratech.dto.response;

import org.akira.auratech.model.Review;
import java.time.Instant;

public record ReviewResponse(
        Integer id,
        Integer userId,
        Integer productId,
        int rating,
        String comment,
        Instant createdAt
) {
    public static ReviewResponse fromEntity(Review review) {
        if (review == null) {
            return null;
        }
        return new ReviewResponse(
                review.getId(),
                review.getUser() == null ? null : review.getUser().getId(),
                review.getProduct() == null ? null : review.getProduct().getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
