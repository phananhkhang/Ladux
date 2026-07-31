package org.akira.ladux.service;

import org.akira.ladux.dto.system.request.NotificationRequest;
import org.akira.ladux.dto.system.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationResponse> getAllNotifications(Pageable pageable);

    Page<NotificationResponse> getAllUnReadNotifications(Pageable pageable);

    Page<NotificationResponse> getAllReadNotifications(Pageable pageable);

    int getUnreadNotificationCount();

    void markAsRead(Integer id);

    void markAllAsRead();

    void deleteNotification(Integer id);

    void deleteAllNotifications();

    // == Admin ==
    String broadcastNotification(NotificationRequest request);
    
    String sendNotificationToUser(NotificationRequest request, Integer id);
    
    Page<NotificationResponse> getAllNotificationsForAdmin(Pageable pageable);

    void deleteNotificationForAdmin(Integer id);

    void deleteAllNotificationsForAdmin();
}
