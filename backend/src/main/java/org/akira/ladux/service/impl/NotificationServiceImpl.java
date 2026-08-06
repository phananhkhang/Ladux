package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.request.NotificationRequest;
import org.akira.ladux.dto.system.response.NotificationResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Notification;
import org.akira.ladux.model.User;
import org.akira.ladux.repository.NotificationRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.NotificationService;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllNotifications(Pageable pageable) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByRecipientIdAndIsDeletedByUserFalseOrderByCreatedAtDesc(currentUserId, pageable).map(NotificationResponse::fromEntity);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllUnReadNotifications(Pageable pageable) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByRecipientIdAndIsReadFalseAndIsDeletedByUserFalseOrderByCreatedAtDesc(currentUserId, pageable).map(NotificationResponse::fromEntity);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllReadNotifications(Pageable pageable) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByRecipientIdAndIsReadTrueAndIsDeletedByUserFalseOrderByCreatedAtDesc(currentUserId, pageable).map(NotificationResponse::fromEntity);
    }
    @Override
    @Transactional(readOnly = true)
    public int getUnreadNotificationCount() {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByRecipientIdAndIsReadFalseAndIsDeletedByUserFalse(currentUserId);
    }
    @Override
    @Transactional
    public void markAsRead(Integer notificationId) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findByIdAndRecipientIdAndIsReadFalseAndIsDeletedByUserFalse(notificationId, currentUserId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo chưa đọc với id = " + notificationId));
        notification.setRead(true);
    }

    @Override
    @Transactional
    public void deleteNotification(Integer notificationId) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findByIdAndRecipientIdAndIsDeletedByUserFalse(notificationId, currentUserId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với id = " + notificationId));
        notification.setDeletedByUser(true);
    }
    @Override
    @Transactional
    public void deleteAllNotifications() {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        notificationRepository.softDeleteAllByUserId(currentUserId);
    }

    // == Admin ==
    // Admin gửi thông báo đến tất cả người dùng
    @Override
    @Transactional
    public String broadcastNotification(NotificationRequest request) {
        int count = notificationRepository.insertBroadcastNotifications(
                request.title(),
                request.message(),
                request.type().name()
        );
        return "Đã gửi thông báo thành công tới " + count + " người dùng.";
    }
    // Admin gửi thông báo đến 1 người dùng cụ thể
    @Override
    @Transactional
    public String sendNotificationToUser(NotificationRequest request, Integer userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id = " + userId));
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(request.title())
                .message(request.message())
                .isRead(false)
                .isDeletedByUser(false)
                .type(request.type())
                .createdAt(Instant.now())
                .build();
        notificationRepository.save(notification);
        return "Thông báo đã được gửi đến người dùng.";
    }
    // Admin xem tất cả thông báo
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllNotificationsForAdmin(Pageable pageable) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(pageable).map(NotificationResponse::fromEntity);
    }
    // Xoa thong bao cho admin (Hard delete từ DB)
    @Override
    @Transactional
    public void deleteNotificationForAdmin(Integer id) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với id = " + id));
        notificationRepository.delete(notification);
    }
    // Xoa tat ca thong bao cho admin (Hard delete tất cả từ DB)
    @Override
    @Transactional
    public void deleteAllNotificationsForAdmin() {
        notificationRepository.deleteAll();
    }

}
