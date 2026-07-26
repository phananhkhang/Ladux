package org.akira.ladux.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.NotificationRequest;
import org.akira.ladux.dto.response.NotificationResponse;
import org.akira.ladux.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {
    private final NotificationService notificationService;
    // Admin gửi thong báo để tất cả mọi người
    @PostMapping
    public ResponseEntity<String> broadcastNotification(@RequestBody NotificationRequest request) {
        notificationService.broadcastNotification(request);
        return ResponseEntity.ok("Thông báo đã được gửi đến tất cả người dùng.");
    }
    // Admin gửi thong báo để 1 người dùng cụ thể
    @PostMapping("/user/{id}")
    public ResponseEntity<String> sendNotificationToUser(@RequestBody NotificationRequest request, @PathVariable Integer id) {
        notificationService.sendNotificationToUser(request, id);
        return ResponseEntity.ok("Thông báo đã được gửi đến người dùng.");
    }
    // Admin xem lai toan bo thong báo
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getAllNotifications(@RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getAllNotificationsForAdmin(pageable));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Integer id) {
        notificationService.deleteNotificationForAdmin(id);
        return ResponseEntity.ok("Thông báo đã được xóa!");
    }
    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllNotifications() {
        notificationService.deleteAllNotificationsForAdmin();
        return ResponseEntity.ok("Tất cả thông báo đã được xóa!");
    }
}
