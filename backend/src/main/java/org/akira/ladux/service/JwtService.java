package org.akira.ladux.service;

import org.akira.ladux.model.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String generateAccessToken(User user);

    String extractUsername(String jwt);

    Integer extractTokenVersion(String jwt);

    boolean isTokenValid(String jwt, UserDetails userDetails);
}
