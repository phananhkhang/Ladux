package org.akira.auratech.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.model.RefreshToken;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Quan ly refresh token dang opaque luu trong DB:
 * - create: phat hanh moi.
 * - verifyAndRotate: xac thuc + xoay vong (revoke cu, phat hanh moi) -> chong replay.
 * - revoke / revokeAllForUser: thu hoi.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final RefreshTokenRepository repo;

    @Value("${app.jwt.refresh-expiration:604800000}") // mac dinh 7 ngay
    private long refreshExpirationMs;

    @Transactional
    public RefreshToken create(User user) {
        RefreshToken token = RefreshToken.builder()
                .token(generateOpaqueToken())
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .build();
        return repo.save(token);
    }

    /**
     * Xac thuc refresh token va xoay vong: revoke token hien tai, phat hanh token moi.
     * Tra ve refresh token MOI (kem user da load san roles).
     */
    @Transactional
    public RefreshToken verifyAndRotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BusinessRuleException("Thieu refresh token");
        }
        RefreshToken current = repo.findByToken(rawToken)
                .orElseThrow(() -> new BusinessRuleException("Refresh token khong hop le"));
        if (!current.isUsable()) {
            throw new BusinessRuleException("Refresh token da het han hoac da bi thu hoi");
        }
        current.setRevoked(true);
        return create(current.getUser());
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        repo.findByToken(rawToken).ifPresent(token -> token.setRevoked(true));
    }

    @Transactional
    public void revokeAllForUser(Integer userId) {
        repo.revokeAllByUserId(userId);
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
