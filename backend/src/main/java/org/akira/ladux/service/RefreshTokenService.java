package org.akira.ladux.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

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
        String rawToken = generateOpaqueToken();
        String hashedToken = hashToken(rawToken);
        RefreshToken token = RefreshToken.builder()
                .token(hashedToken)
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .build();
        RefreshToken savedToken = repo.save(token);

        // Khong gan rawToken len savedToken: entity nay dang managed, JPA dirty checking se
        // ghi de hash trong DB bang token tho khi transaction commit. Tra mot holder tach
        // biet cho controller de dua raw token vao cookie.
        return RefreshToken.builder()
                .id(savedToken.getId())
                .token(rawToken)
                .user(savedToken.getUser())
                .expiryDate(savedToken.getExpiryDate())
                .revoked(savedToken.isRevoked())
                .createdAt(savedToken.getCreatedAt())
                .build();
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
        RefreshToken current = findStoredToken(rawToken)
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
        findStoredToken(rawToken).ifPresent(token -> token.setRevoked(true));
    }

   // Thu hoi dong thoi tăng tokenVersion cho user -> vo hieu hoa TUC THI access token cu cua user.
    @Transactional
    public void revokeSessionAndBump(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        findStoredToken(rawToken).ifPresent(token -> {
            token.setRevoked(true);
            userRepository.incrementTokenVersion(token.getUser().getId());
        });
    }

    /**
     * Thu hoi toan bo refresh token cua user (KHONG tu bump tokenVersion).
     * Goi tu cac luong dang co User entity managed (updateUser/changePassword):
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

    /**
     * Uu tien token da bam. Fallback token tho chi de cac phien tao boi ban cu
     * tiep tuc refresh/logout duoc; lan rotate ke tiep se tu dong luu dung hash.
     */
    private Optional<RefreshToken> findStoredToken(String rawToken) {
        Optional<RefreshToken> hashed = repo.findByToken(hashToken(rawToken));
        return hashed.isPresent() ? hashed : repo.findByToken(rawToken);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashedBytes);
        }
        catch(NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
