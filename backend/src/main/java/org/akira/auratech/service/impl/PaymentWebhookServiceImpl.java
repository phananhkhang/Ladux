package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.OrderLifecycleService;
import org.akira.auratech.service.PaymentWebhookResult;
import org.akira.auratech.service.PaymentWebhookService;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Production-ready webhook handler cho VNPay IPN.
 *
 * Nguyen tac:
 * 1. Validate signature TRUOC khi mo transaction DB (tiet kiem tai nguyen, chan fake request som).
 * 2. Idempotency bang State Check + Unique Key (transaction_no) tren DB.
 * 3. Khong update Order truc tiep — goi OrderLifecycleService (state machine + side effects).
 * 4. Luu gateway_transaction_no (vnp_TransactionNo) vao payment.transaction_no de doi soat.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private static final String VNP_RESPONSE_SUCCESS = "00";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;

    @Value("${payment.vnpay.secret-key}")
    private String vnpaySecretKey;

    @Override
    @Transactional
    public PaymentWebhookResult processVNPayWebhook(Map<String, String> params) {
        // --- BUOC 1: Validate Signature ---
        // Gateway webhook la public endpoint — chi tin tuong request co chu ky HMAC hop le.
        // Chay truoc moi DB operation; sai chu ky -> reject ngay (403), khong mo state machine.
        String secureHash = params.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            log.warn("[WEBHOOK] VNPay callback thieu vnp_SecureHash");
            return PaymentWebhookResult.invalidSignature();
        }
        if (!isValidVNPaySignature(params, secureHash)) {
            log.warn("[WEBHOOK] VNPay callback co chu ky khong hop le");
            return PaymentWebhookResult.invalidSignature();
        }

        // --- BUOC 2: Trich xuat du lieu can thiet tu payload Gateway ---
        String gatewayTransactionNo = params.get("vnp_TransactionNo");
        String orderRef = params.get("vnp_TxnRef");
        String gatewayAmountRaw = params.get("vnp_Amount");
        String responseCode = params.get("vnp_ResponseCode");

        if (gatewayTransactionNo == null || gatewayTransactionNo.isBlank()) {
            log.warn("[WEBHOOK] VNPay callback thieu vnp_TransactionNo (gateway_transaction_no)");
            return PaymentWebhookResult.orderNotFound();
        }
        if (orderRef == null || orderRef.isBlank()) {
            log.warn("[WEBHOOK] VNPay callback thieu vnp_TxnRef (order reference)");
            return PaymentWebhookResult.orderNotFound();
        }

        int orderId;
        try {
            orderId = Integer.parseInt(orderRef);
        } catch (NumberFormatException ex) {
            log.warn("[WEBHOOK] vnp_TxnRef khong phai so hop le: {}", orderRef);
            return PaymentWebhookResult.orderNotFound();
        }

        // --- BUOC 3: DB Transaction — idempotency + state machine ---
        try {
            return processPaymentUpdate(orderId, gatewayTransactionNo, gatewayAmountRaw, responseCode);
        } catch (DataIntegrityViolationException ex) {
            // Race condition: hai request dong thoi cung gateway_transaction_no — unique constraint chan request thu hai.
            // Tra 200 OK (idempotent) de Gateway khong retry vo han va khong danh dau callback that bai.
            log.info("[WEBHOOK] Race condition tren gateway_transaction_no={}, tra ve idempotent 200",
                    gatewayTransactionNo);
            return PaymentWebhookResult.idempotent();
        }
    }

    private PaymentWebhookResult processPaymentUpdate(
            int orderId,
            String gatewayTransactionNo,
            String gatewayAmountRaw,
            String responseCode
    ) {
        // --- IDEMPOTENCY: Tim theo gateway_transaction_no truoc ---
        // Neu payment da SUCCESS voi ma nay -> Gateway goi lai lan 2, 3... -> tra 200 ngay.
        Optional<Payment> existingByGatewayTxn = paymentRepository.findByTransactionNo(gatewayTransactionNo);
        if (existingByGatewayTxn.isPresent()) {
            Payment existing = existingByGatewayTxn.get();
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                log.info("[WEBHOOK] Idempotent: gateway_transaction_no={} da SUCCESS, bo qua xu ly",
                        gatewayTransactionNo);
                return PaymentWebhookResult.idempotent();
            }
        }

        // Lock payment moi nhat cua don hang de tranh race condition tren cung mot order.
        Payment payment = paymentRepository.findTopByOrder_IdOrderByCreatedAtDesc(orderId)
                .orElse(null);
        if (payment == null) {
            log.warn("[WEBHOOK] Khong tim thay payment cho orderId={}", orderId);
            return PaymentWebhookResult.orderNotFound();
        }

        // Lock order kem items/coupon de lifecycle service co the hoan kho / coupon khi FAILED.
        Order order = orderRepository.findWithItemsByIdForUpdate(orderId)
                .orElse(null);
        if (order == null) {
            log.warn("[WEBHOOK] Khong tim thay order orderId={}", orderId);
            return PaymentWebhookResult.orderNotFound();
        }

        // State check lan 2: payment da SUCCESS (co the do admin confirm truoc) -> idempotent.
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[WEBHOOK] Idempotent: payment orderId={} da SUCCESS, bo qua xu ly", orderId);
            return PaymentWebhookResult.idempotent();
        }

        // --- KHOP DU LIEU: So tien Gateway phai khop order.finalAmount ---
        // VNPay gui vnp_Amount theo don vi xu (VND * 100), vi du 150000 VND -> "15000000".
        if (!isAmountMatched(order, gatewayAmountRaw)) {
            log.error(
                    "[WEBHOOK][ALERT] AMOUNT MISMATCH — orderId={}, gateway_transaction_no={}, " +
                            "order.finalAmount={}, gateway.vnp_Amount={}. TU CHOI cap nhat trang thai!",
                    orderId, gatewayTransactionNo, order.getFinalAmount(), gatewayAmountRaw
            );
            return PaymentWebhookResult.amountMismatch("Invalid amount");
        }

        // --- Luu gateway_transaction_no de doi soat / CSKH ---
        payment.setTransactionNo(gatewayTransactionNo);

        // --- STATE MACHINE: Khong set order.status truc tiep — goi lifecycle workflow ---
        boolean paymentSucceeded = VNP_RESPONSE_SUCCESS.equals(responseCode);
        PaymentStatus newStatus = paymentSucceeded ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
        payment.setStatus(newStatus);
        applyPaymentStatusViaWorkflow(order, newStatus);

        paymentRepository.save(payment);

        log.info("[WEBHOOK] Da xu ly webhook: orderId={}, gateway_transaction_no={}, status={}",
                orderId, gatewayTransactionNo, newStatus);
        return PaymentWebhookResult.processed();
    }

    /**
     * Workflow/State Machine — kich hoat side effects (xac nhan don, hoan kho, huy coupon, ghi history...).
     * KHONG dung order.setStatus() truc tiep o day.
     */
    private void applyPaymentStatusViaWorkflow(Order order, PaymentStatus status) {
        if (status == PaymentStatus.SUCCESS) {
            orderLifecycleService.confirmAfterSuccessfulPayment(order);
        } else if (status == PaymentStatus.FAILED) {
            orderLifecycleService.cancelOrder(order, "Payment failed via VNPay webhook");
        }
    }

    /**
     * VNPay quy dinh: sort params alphabet, noi key=value&, HMAC-SHA512 voi secret key.
     */
    private boolean isValidVNPaySignature(Map<String, String> params, String secureHash) {
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

        String computedChecksum = HmacUtils.hmacSha512Hex(vnpaySecretKey, signData.toString());
        return computedChecksum.equalsIgnoreCase(secureHash);
    }

    private boolean isAmountMatched(Order order, String gatewayAmountRaw) {
        if (gatewayAmountRaw == null || gatewayAmountRaw.isBlank()) {
            return false;
        }
        try {
            BigDecimal gatewayAmountInCents = new BigDecimal(gatewayAmountRaw);
            BigDecimal orderAmountInCents = order.getFinalAmount().multiply(BigDecimal.valueOf(100));
            return orderAmountInCents.compareTo(gatewayAmountInCents) == 0;
        } catch (NumberFormatException ex) {
            log.warn("[WEBHOOK] vnp_Amount khong parse duoc: {}", gatewayAmountRaw);
            return false;
        }
    }
}