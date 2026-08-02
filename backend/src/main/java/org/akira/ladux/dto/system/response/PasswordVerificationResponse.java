package org.akira.ladux.dto.system.response;

import java.time.Instant;

public record PasswordVerificationResponse(
        String verificationId,
        Instant verifiedAt,
        Instant expiresAt
) {
}
