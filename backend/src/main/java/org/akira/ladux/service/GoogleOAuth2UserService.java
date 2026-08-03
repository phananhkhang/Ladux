package org.akira.ladux.service;

import org.akira.ladux.model.User;

public interface GoogleOAuth2UserService {

    User loginOrRegister(
            String googleSubject,
            String email,
            boolean emailVerified,
            String fullName,
            String pictureUrl
    );
}