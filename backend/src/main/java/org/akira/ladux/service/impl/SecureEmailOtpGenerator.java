package org.akira.ladux.service.impl;

import org.akira.ladux.service.EmailOtpGenerator;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class SecureEmailOtpGenerator
        implements EmailOtpGenerator {

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Override
    public String generate() {
        return "%06d".formatted(
                secureRandom.nextInt(1_000_000)
        );
    }
}