package org.akira.ladux.dto.internal.otp;

public record ProviderOtpResponse(
        String providerVerificationId,
        String status
) {
}