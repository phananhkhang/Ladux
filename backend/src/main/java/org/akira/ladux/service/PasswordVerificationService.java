package org.akira.ladux.service;

public interface PasswordVerificationService {

    void consume(
            Integer customerId,
            String verificationId
    );
}