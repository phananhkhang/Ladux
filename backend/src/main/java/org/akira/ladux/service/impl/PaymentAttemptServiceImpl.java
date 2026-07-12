package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.PaymentCallbackResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.Payment;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.model.enums.PaymentProvider;
import org.akira.ladux.model.enums.PaymentStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.PaymentRepository;
import org.akira.ladux.service.PaymentAttemptService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

// Quan ly vong doi payment attempt gan voi don hang.
// initializePayment: goi tu createOrder — tao Payment PENDING + set paymentExpiresAt (15 phut, tru COD).
// retryPayment: chi khi lan thanh toan gan nhat FAILED — tao attempt PENDING moi.
@Service
@RequiredArgsConstructor
public class PaymentAttemptServiceImpl implements PaymentAttemptService {
    // Thoi gian cho thanh toan truoc khi job tu huy don PENDING.
    private static final Duration PAYMENT_TIMEOUT = Duration.ofMinutes(15);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public void initializePayment(Order order, PaymentProvider provider, BigDecimal amount) {
        // COD không có hạn thanh toán — khách trả khi nhận hàng.
        order.setPaymentExpiresAt(paymentExpiresAt(provider));
        order.getPayments().add(Payment.builder()
                .order(order)
                .provider(provider)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .build());
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public PaymentCallbackResponse retryPayment(int userId, int orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang khong con o trang thai co the thanh toan lai");
        }

        if (order.getUser().getId() != userId) {
            throw new BusinessRuleException("Khong the thu lai thanh toan cho don hang cua nguoi khac");
        }

        Payment lastPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new BusinessRuleException("Don hang chua co lan thanh toan nao de thu lai"));

        if (lastPayment.getStatus() != PaymentStatus.FAILED) {
            throw new BusinessRuleException("Chi co the thanh toan lai khi lan thanh toan gan nhat FAILED");
        }

        Payment retry = Payment.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .provider(lastPayment.getProvider())
                .build();
        return PaymentCallbackResponse.fromEntity(paymentRepository.save(retry));
    }

    private Instant paymentExpiresAt(PaymentProvider provider) {
        return provider == PaymentProvider.COD ? null : Instant.now().plus(PAYMENT_TIMEOUT);
    }
}

