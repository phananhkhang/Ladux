package org.akira.ladux.dto.system.request;

import org.akira.ladux.model.enums.NotificationType;

import java.io.Serializable;

public record NotificationRequest(
        String title,
        String message,
        NotificationType type
) implements Serializable {
}
