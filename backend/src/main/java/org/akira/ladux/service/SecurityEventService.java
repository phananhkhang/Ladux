package org.akira.ladux.service;

import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.SecurityEventType;

public interface SecurityEventService {

    void record(User user, SecurityEventType eventType, String ipAddress, String userAgent, boolean success);
}
