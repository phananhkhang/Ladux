package org.akira.ladux.service.impl;

import org.akira.ladux.model.SecurityEvent;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.SecurityEventType;
import org.akira.ladux.repository.SecurityEventRepository;
import org.akira.ladux.service.SecurityEventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecurityEventServiceImpl implements SecurityEventService {

    private final SecurityEventRepository securityEventRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(User user, SecurityEventType eventType, String ipAddress, String userAgent, boolean success) {
        securityEventRepository.save(SecurityEvent.builder()
                .user(user)
                .eventType(eventType)
                .ipAddress(trim(ipAddress, 64))
                .userAgent(trim(userAgent, 500))
                .success(success)
                .build());
    }

    private String trim(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.substring(0, Math.min(value.length(), maxLength));
    }
}
