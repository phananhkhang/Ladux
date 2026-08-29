package org.akira.ladux.service;

import org.akira.ladux.model.User;

public interface MfaService {

    boolean requiresMfa(User user);

    boolean verifyTotp(User user, String code);

    void enableTotp(User user, String base32Secret);
}
