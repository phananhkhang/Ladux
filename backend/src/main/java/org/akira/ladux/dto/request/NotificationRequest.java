package org.akira.ladux.dto.request;

import org.akira.ladux.model.enums.NotificationTargetType;
import org.akira.ladux.model.enums.NotificationType;

import java.io.Serializable;

public record NotificationRequest(
        String title,
        String message,
        NotificationType type,
        NotificationTargetType targetType,
        Integer targetId
) implements Serializable {
}
