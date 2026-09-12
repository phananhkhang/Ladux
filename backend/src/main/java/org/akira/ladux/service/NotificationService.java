package org.akira.ladux.service;

import org.akira.ladux.dto.system.request.NotificationRequest;
import org.akira.ladux.dto.system.response.NotificationResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    PageResponse<NotificationResponse> getAllNotifications(Pageable pageable);

    PageResponse<NotificationResponse> getAllUnReadNotifications(Pageable pageable);

    PageResponse<NotificationResponse> getAllReadNotifications(Pageable pageable);

    int getUnreadNotificationCount();

    void markAsRead(Integer id);

    void deleteNotification(Integer id);

    void deleteAllNotifications();

    // == Admin ==
    String broadcastNotification(NotificationRequest request);
    
    String sendNotificationToUser(NotificationRequest request, Integer id);
    
    PageResponse<NotificationResponse> getAllNotificationsForAdmin(Pageable pageable);

    void deleteNotificationForAdmin(Integer id);

    void deleteAllNotificationsForAdmin();

    void markAsReadForAdmin(Integer id);

    int getUnreadNotificationCountForAdmin();
}
