package org.akira.ladux.service.impl;

import java.time.Instant;

import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.User;
import org.akira.ladux.model.UserMfaMethod;
import org.akira.ladux.model.enums.MfaType;
import org.akira.ladux.repository.UserMfaMethodRepository;
import org.akira.ladux.service.MfaSecretCipher;
import org.akira.ladux.service.MfaService;
import org.akira.ladux.service.TotpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MfaServiceImpl implements MfaService {

    private final UserMfaMethodRepository userMfaMethodRepository;
    private final MfaSecretCipher mfaSecretCipher;
    private final TotpService totpService;

    @Override
    public boolean requiresMfa(User user) {
        return user != null && user.getRoles() != null && user.getRoles().stream()
                .map(role -> role.getName().name())
                .anyMatch(role -> "ADMIN".equals(role) || "STAFF".equals(role) || role.startsWith("STAFF_"));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyTotp(User user, String code) {
        if (!requiresMfa(user)) {
            return true;
        }
        UserMfaMethod method = userMfaMethodRepository
                .findFirstByUserIdAndTypeAndEnabledTrueOrderByIdDesc(user.getId(), MfaType.TOTP)
                .orElseThrow(() -> new BusinessRuleException("Tai khoan chua cau hinh TOTP"));
        return totpService.verifyCode(mfaSecretCipher.decrypt(method.getSecretEncrypted()), code);
    }

    /** For a future authenticated enrollment flow; stores no plaintext MFA material. */
    @Override
    @Transactional
    public void enableTotp(User user, String base32Secret) {
        if (!totpService.isValidSecret(base32Secret)) {
            throw new BusinessRuleException("TOTP secret khong hop le");
        }
        UserMfaMethod method = userMfaMethodRepository
                .findFirstByUserIdAndTypeAndEnabledTrueOrderByIdDesc(user.getId(), MfaType.TOTP)
                .orElseGet(() -> UserMfaMethod.builder().user(user).type(MfaType.TOTP).build());
        method.setSecretEncrypted(mfaSecretCipher.encrypt(base32Secret));
        method.setEnabled(true);
        method.setVerifiedAt(Instant.now());
        userMfaMethodRepository.save(method);
    }
}
