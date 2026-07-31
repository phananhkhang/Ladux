package org.akira.ladux.dto.response.user;

import org.akira.ladux.model.Notification;
import org.akira.ladux.model.enums.NotificationTargetType;
import org.akira.ladux.model.enums.NotificationType;

import java.io.Serializable;
import java.time.Instant;

public record NotificationResponse(
        Integer id,
        String title,
        String message,
        boolean isRead,
        NotificationType type,
        NotificationTargetType targetType,
        Integer targetId,
        Instant createdAt
) implements Serializable {
    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getType(),
                notification.getTargetType(),
                notification.getTargetId(),
                notification.getCreatedAt()
        );
    }
}
