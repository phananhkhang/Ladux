package org.akira.auratech.dto.response;

import org.akira.auratech.model.Review;
import java.io.Serializable;
import java.time.Instant;

public record ReviewResponse(
        Integer id,
        String reviewerName,
        String reviewerAvatar,
        int rating,
        String comment,
        Instant createdAt
) implements Serializable {
    public static ReviewResponse fromEntity(Review review) {
        if (review == null) {
            return null;
        }
        return new ReviewResponse(
                review.getId(),
                review.getUser() == null ? "Anonymous" : review.getUser().getFullName(),
                review.getUser() == null ? null : review.getUser().getAvatar(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
