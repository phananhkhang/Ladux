package org.akira.ladux.model;

import java.time.Instant;

import org.akira.ladux.model.enums.NotificationTargetType;
import org.akira.ladux.model.enums.NotificationType;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Người nhận thông báo (Khách hàng hoặc Admin/Staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User recipient;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    // Trạng thái đã đọc chưa (để hiện chấm đỏ notification trên UI)
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // Phân loại thông báo (ORDER, SYSTEM, PROMOTION, INVENTORY...)
    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private NotificationType type;

    // Tận dụng kỹ thuật Polymorphic Reference giống StockMovement!
    // Dùng để điều hướng người dùng khi CLICK vào thông báo (VD: bấm vào mở đúng đơn hàng #101)
    @Column(name = "target_type", length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationTargetType targetType; // "ORDER", "PRODUCT", "PROMOTION"...

    @Column(name = "target_id")
    private Integer targetId; // ID của Order, Product hoặc Voucher tương ứng

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;
}