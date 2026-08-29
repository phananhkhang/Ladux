package org.akira.ladux.repository;

import org.akira.ladux.model.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
}
