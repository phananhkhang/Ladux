package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.OrderHistory;

import java.time.Instant;

@Getter
@Setter
@Builder
public class OrderHistoryResponse {
    private Integer id;
    private Integer orderId;
    private String status;
    private String description;
    private Instant createdAt;

    public static OrderHistoryResponse fromEntity(OrderHistory history) {
        if (history == null) {
            return null;
        }
        return OrderHistoryResponse.builder()
                .id(history.getId())
                .orderId(history.getOrder() == null ? null : history.getOrder().getId())
                .status(history.getStatus())
                .description(history.getDescription())
                .createdAt(history.getCreatedAt())
                .build();
    }
}

