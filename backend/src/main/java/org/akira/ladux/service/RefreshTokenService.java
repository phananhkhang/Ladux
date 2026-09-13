package org.akira.ladux.service;

import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;

public interface RefreshTokenService {

    RefreshToken create(User user);

    RefreshToken createRefreshToken(User user, String familyId, Long parentId);

    RefreshToken verifyAndRotate(String rawToken);

    void revokeFamily(String familyId);

    void revoke(String rawToken);

    void revokeSessionAndBump(String rawToken);

    void revokeAllRefreshTokens(Integer userId);
}
