package org.akira.ladux.service;

public interface MfaSecretCipher {

    String encrypt(String plainText);

    String decrypt(String encryptedText);
}
