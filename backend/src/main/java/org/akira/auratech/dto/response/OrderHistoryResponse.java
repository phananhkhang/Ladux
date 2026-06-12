package org.akira.auratech.dto.response;

import org.akira.auratech.model.OrderHistory;
import java.io.Serializable;
import java.time.Instant;

public record OrderHistoryResponse(
        Integer id,
        Integer orderId,
        String status,
        String description,
        Instant createdAt
) implements Serializable {
    public static OrderHistoryResponse fromEntity(OrderHistory history) {
        if (history == null) {
            return null;
        }
        return new OrderHistoryResponse(
                history.getId(),
                history.getOrder() == null ? null : history.getOrder().getId(),
                history.getStatus(),
                history.getDescription(),
                history.getCreatedAt()
        );
    }
}
