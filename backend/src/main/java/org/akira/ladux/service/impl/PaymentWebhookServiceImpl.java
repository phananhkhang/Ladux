package org.akira.ladux.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.akira.ladux.config.VNPayProperties;
import org.akira.ladux.dto.internal.PaymentWebhookResult;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.Payment;
import org.akira.ladux.model.enums.PaymentProvider;
import org.akira.ladux.model.enums.PaymentStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.PaymentRepository;
import org.akira.ladux.service.OrderLifecycleService;
import org.akira.ladux.service.PaymentWebhookService;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Production-ready webhook handler cho VNPay IPN.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private static final String VNP_RESPONSE_SUCCESS = "00";
    private static final String VNP_TRANSACTION_SUCCESS = "00";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;
    private final VNPayProperties vnPayProperties;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "coupons", allEntries = true)
    })
    public PaymentWebhookResult processVNPayWebhook(Map<String, String> params) {
        // --- BUOC 1: Validate Signature ---
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            log.warn("[WEBHOOK] VNPay callback thieu vnp_SecureHash");
            return PaymentWebhookResult.invalidSignature();
        }

        if (!isValidVNPaySignature(params, secureHash)) {
            log.warn("[WEBHOOK] VNPay callback co chu ky khong hop le");
            return PaymentWebhookResult.invalidSignature();
        }

        // --- BUOC 2: Validate tmnCode ---
        String tmnCode = params.get("vnp_TmnCode");
        if (tmnCode == null || !vnPayProperties.getTmnCode().equals(tmnCode)) {
            log.warn("[WEBHOOK] vnp_TmnCode không khớp: {}", tmnCode);
            return PaymentWebhookResult.invalidSignature();
        }

        // --- BUOC 3: Trich xuat du lieu ---
        String gatewayTransactionNo = params.get("vnp_TransactionNo");
        String merchantTxnRef = params.get("vnp_TxnRef");
        String gatewayAmountRaw = params.get("vnp_Amount");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        if (merchantTxnRef == null || merchantTxnRef.isBlank()) {
            log.warn("[WEBHOOK] VNPay callback thieu vnp_TxnRef (merchantTxnRef)");
            return PaymentWebhookResult.orderNotFound();
        }

        // --- BUOC 4: DB Transaction — idempotency + lock payment theo merchantTxnRef ---
        try {
            return processPaymentUpdate(merchantTxnRef, gatewayTransactionNo, gatewayAmountRaw, responseCode, transactionStatus);
        } catch (DataIntegrityViolationException ex) {
            log.info("[WEBHOOK] Race condition tren gateway_transaction_no={}, tra ve idempotent 200", gatewayTransactionNo);
            return PaymentWebhookResult.idempotent();
        }
    }

    private PaymentWebhookResult processPaymentUpdate(
            String merchantTxnRef,
            String gatewayTransactionNo,
            String gatewayAmountRaw,
            String responseCode,
            String transactionStatus
    ) {
        // --- IDEMPOTENCY: Tim theo gateway_transaction_no neu da ton tai ---
        if (gatewayTransactionNo != null && !gatewayTransactionNo.isBlank()) {
            Optional<Payment> existingByGatewayTxn = paymentRepository.findByTransactionNo(gatewayTransactionNo);
            if (existingByGatewayTxn.isPresent() && existingByGatewayTxn.get().getStatus() == PaymentStatus.SUCCESS) {
                log.info("[WEBHOOK] Idempotent: gateway_transaction_no={} da SUCCESS, bo qua xu ly", gatewayTransactionNo);
                return PaymentWebhookResult.idempotent();
            }
        }

        // Lock payment theo merchantTxnRef
        Payment payment = paymentRepository.findByMerchantTxnRefForUpdate(merchantTxnRef).orElse(null);
        if (payment == null) {
            log.warn("[WEBHOOK] Khong tim thay payment cho merchantTxnRef={}", merchantTxnRef);
            return PaymentWebhookResult.orderNotFound();
        }

        if (payment.getProvider() != PaymentProvider.VNPAY) {
            log.warn("[WEBHOOK] Payment id={} khong phai VNPAY provider", payment.getId());
            return PaymentWebhookResult.orderNotFound();
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[WEBHOOK] Idempotent: payment merchantTxnRef={} da SUCCESS", merchantTxnRef);
            return PaymentWebhookResult.idempotent();
        }

        Order order = orderRepository.findWithItemsByIdForUpdate(payment.getOrder().getId()).orElse(null);
        if (order == null) {
            log.warn("[WEBHOOK] Khong tim thay order cho payment id={}", payment.getId());
            return PaymentWebhookResult.orderNotFound();
        }

        // So sanh amount tu gateway voi payment.getAmount()
        if (!isAmountMatched(payment, gatewayAmountRaw)) {
            log.error("[WEBHOOK][ALERT] AMOUNT MISMATCH — merchantTxnRef={}, payment.amount={}, gateway.vnp_Amount={}",
                    merchantTxnRef, payment.getAmount(), gatewayAmountRaw);
            return PaymentWebhookResult.amountMismatch("Invalid amount");
        }

        if (gatewayTransactionNo != null && !gatewayTransactionNo.isBlank()) {
            payment.setTransactionNo(gatewayTransactionNo);
        }

        boolean paymentSucceeded = VNP_RESPONSE_SUCCESS.equals(responseCode)
                && VNP_TRANSACTION_SUCCESS.equals(transactionStatus);

        if (paymentSucceeded) {
            payment.setStatus(PaymentStatus.SUCCESS);
            orderLifecycleService.confirmAfterSuccessfulPayment(order);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        log.info("[WEBHOOK] Da xu ly webhook: merchantTxnRef={}, status={}", merchantTxnRef, payment.getStatus());
        return PaymentWebhookResult.processed();
    }

    private boolean isValidVNPaySignature(Map<String, String> params, String secureHash) {
        String secretKey = vnPayProperties.getHashSecret();
        if (secretKey == null || secretKey.isBlank()) {
            return false;
        }

        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder signData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                signData.append(fieldName).append("=").append(fieldValue).append("&");
            }
        }
        if (!signData.isEmpty()) {
            signData.setLength(signData.length() - 1);
        }

        String computedChecksum = new HmacUtils(HmacAlgorithms.HMAC_SHA_512, secretKey)
                .hmacHex(signData.toString());
        return computedChecksum.equalsIgnoreCase(secureHash);
    }

    private boolean isAmountMatched(Payment payment, String gatewayAmountRaw) {
        if (gatewayAmountRaw == null || gatewayAmountRaw.isBlank()) {
            return false;
        }
        try {
            BigDecimal gatewayAmountInCents = new BigDecimal(gatewayAmountRaw);
            BigDecimal paymentAmountInCents = payment.getAmount().multiply(BigDecimal.valueOf(100));
            return paymentAmountInCents.compareTo(gatewayAmountInCents) == 0;
        } catch (NumberFormatException ex) {
            log.warn("[WEBHOOK] vnp_Amount khong parse duoc: {}", gatewayAmountRaw);
            return false;
        }
    }
}