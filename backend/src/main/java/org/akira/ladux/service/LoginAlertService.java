package org.akira.ladux.service;

import org.akira.ladux.model.User;

public interface LoginAlertService {

    void sendNewLoginAlert(User user, String ipAddress, String userAgent, boolean newIp, boolean newDevice);
}
