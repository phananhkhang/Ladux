package org.akira.auratech.exception;

public class InsufficientStockException extends BusinessRuleException {
    public InsufficientStockException(String message) {
        super(message);
    }
}
