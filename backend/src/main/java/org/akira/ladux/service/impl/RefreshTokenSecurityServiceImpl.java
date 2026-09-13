package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.RefreshTokenSecurityService;
import org.akira.ladux.service.RefreshTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenSecurityServiceImpl implements RefreshTokenSecurityService {
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleReuse(String familyId, Integer userId) {
        refreshTokenService.revokeFamily(familyId);
        userRepository.incrementTokenVersion(userId);
    }
}
