package org.akira.ladux.dto.system.response;

import java.time.Instant;

public record EmailOtpSendResponse(
        String verificationId,
        String maskedEmail,
        Instant expiresAt,
        int resendAfterSeconds
) {
}
