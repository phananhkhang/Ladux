package org.akira.ladux.service;

public interface RefreshTokenSecurityService {
    void handleReuse(String familyId, Integer userId);
}
