package org.akira.ladux.service;

import org.akira.ladux.model.User;

public interface LoginHistoryService {

    LoginHistoryResult recordSuccessfulLogin(User user, String ipAddress, String deviceIdHash, String userAgent, boolean mfaUsed);

    record LoginHistoryResult(boolean newIp, boolean newDevice) {
    }
}
