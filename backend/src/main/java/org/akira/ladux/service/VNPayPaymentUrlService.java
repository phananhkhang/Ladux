package org.akira.ladux.service;

import org.akira.ladux.model.Payment;

public interface VNPayPaymentUrlService {

    String createPaymentUrl(
            Payment payment,
            String clientIp
    );
}