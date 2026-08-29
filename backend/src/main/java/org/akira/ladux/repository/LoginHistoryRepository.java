package org.akira.ladux.repository;

import org.akira.ladux.model.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    boolean existsByUserIdAndIpAddress(Integer userId, String ipAddress);

    boolean existsByUserIdAndDeviceIdHash(Integer userId, String deviceIdHash);
}
