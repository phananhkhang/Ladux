package org.akira.ladux.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.repository.RefreshTokenRepository;
import org.akira.ladux.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Quan ly refresh token dang opaque luu trong DB:
 * - create: phat hanh moi.
 * - verifyAndRotate: xac thuc + xoay vong (revoke cu, phat hanh moi) -> chong replay.
 * - revoke / revokeAllForUser: thu hoi.
 *
 * Phoi hop voi User.tokenVersion de vo hieu hoa TUC THI access token cu.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final RefreshTokenRepository repo;
    private final UserRepository userRepository;

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

    /**
     * Logout: thu hoi refresh token cua phien hien tai VA tang tokenVersion cua user
     * de access token cu chet ngay lap tuc (luu y: dieu nay dang xuat tat ca thiet bi cua user).
     * An toan vi transaction nay khong co User entity nao bi "dirty".
     */
    @Transactional
    public void revokeSessionAndBump(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        repo.findByToken(rawToken).ifPresent(token -> {
            token.setRevoked(true);
            userRepository.incrementTokenVersion(token.getUser().getId());
        });
    }

    /**
     * Thu hoi toan bo refresh token cua user (KHONG tu bump tokenVersion).
     * Goi tu cac luong dang co User entity managed (updateUser/updateProfile):
     * o do caller tu tang user.tokenVersion truc tiep tren entity de tranh bi flush ghi de.
     */
    @Transactional
    public void revokeAllRefreshTokens(Integer userId) {
        repo.revokeAllByUserId(userId);
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
