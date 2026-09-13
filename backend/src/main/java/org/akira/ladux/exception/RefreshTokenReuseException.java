package org.akira.ladux.exception;

public class RefreshTokenReuseException extends RuntimeException{
    public RefreshTokenReuseException(String message) {
        super(message);
    }
}
