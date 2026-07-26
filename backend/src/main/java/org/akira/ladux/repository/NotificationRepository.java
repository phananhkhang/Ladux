package org.akira.ladux.repository;

import io.micrometer.observation.ObservationFilter;
import org.akira.ladux.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer currentUserId, Pageable pageable);
    Page<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Integer currentUserId, Pageable pageable);
    Page<Notification> findByRecipientIdAndIsReadTrueOrderByCreatedAtDesc(Integer currentUserId, Pageable pageable);
    void deleteByRecipientId(Integer currentUserId);

    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);

    int countByRecipientIdAndIsReadFalse(Integer currentUserId);

    Optional<Notification> findByIdAndRecipientIdAndIsReadFalse(Integer notificationId, Integer currentUserId);

    Optional<Notification> findByIdAndRecipientId(Integer notificationId, Integer currentUserId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :currentUserId AND n.isRead = false")
    void markAllAsReadByUserId(Integer currentUserId);
}
