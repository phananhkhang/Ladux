package org.akira.ladux.dto.system.response;

import org.akira.ladux.model.Customer;
import org.akira.ladux.model.Notification;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.NotificationType;

import java.io.Serializable;
import java.time.Instant;

public record NotificationResponse(
        Integer id,
        Integer userId,
        String userName,
        String title,
        String message,
        boolean isRead,
        NotificationType type,
        Instant createdAt
) implements Serializable {
    public static NotificationResponse fromEntity(Notification notification) {
        User recipient = notification.getRecipient();
        Customer customer = recipient != null ? recipient.getCustomer() : null;
        String name = customer != null && customer.getFullName() != null && !customer.getFullName().isBlank()
                ? customer.getFullName()
                : (recipient != null ? recipient.getUsername() : null);

        return new NotificationResponse(
                notification.getId(),
                recipient != null ? recipient.getId() : null,
                name,
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getType(),
                notification.getCreatedAt()
        );
    }
}
