package org.akira.ladux.model.enums;

public enum SecurityEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    MFA_REQUIRED,
    MFA_SUCCESS,
    MFA_FAILED,
    NEW_IP_LOGIN,
    NEW_DEVICE_LOGIN,
    PASSWORD_CHANGED
}
