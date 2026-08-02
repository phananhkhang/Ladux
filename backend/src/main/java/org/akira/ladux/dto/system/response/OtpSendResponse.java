package org.akira.ladux.dto.system.response;

public record OtpSendResponse(
        String verificationId,
        String maskedPhone,
        int expiresInSeconds
) {
}
