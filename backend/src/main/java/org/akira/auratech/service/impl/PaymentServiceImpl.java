package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.request.PaymentCreateRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.OrderLifecycleService;
import org.akira.auratech.service.PaymentService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository repo;
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getAllPayments(Pageable pageable) {
        return repo.findAll(pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'id:' + #id")
    public PaymentCallbackResponse getPaymentById(int id) {
        return PaymentCallbackResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'user:' + #userId + ':order:' + #orderId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getPaymentsByOrderId(int userId, int orderId, Pageable pageable) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order"));

        if (order.getUser().getId() != userId) {
            throw new BusinessRuleException("Ban khong co quyen xem thong tin thanh toan cua don hang nay");
        }

        return repo.findByOrderId(orderId, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'status:' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return repo.findByStatus(status, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public PaymentCallbackResponse createPayment(int userId, PaymentCreateRequest request) {
        Order order = orderRepository.findByIdForUpdate(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Ban khong co quyen tao thanh toan cho don hang nay");
        }

        ensureOrderCanAcceptPayment(order);

        repo.findFirstByOrderIdOrderByCreatedAtDesc(order.getId()).ifPresent(lastPayment -> {
            if (lastPayment.getStatus() != PaymentStatus.FAILED) {
                throw new BusinessRuleException("Chi tao payment attempt moi khi lan truoc FAILED");
            }
        });

        Payment payment = Payment.builder()
                .order(order)
                .provider(request.provider())
                .amount(order.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .build();
        Payment savedPayment = repo.save(payment);
        return PaymentCallbackResponse.fromEntity(savedPayment);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true)
    })
    public PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request) {
        Payment payment = repo.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id));

        Order order = orderRepository.findWithItemsByIdForUpdate(payment.getOrder().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order cua payment id = " + id));

        if (!order.getId().equals(request.orderId())) {
            throw new BusinessRuleException("OrderId khong khop voi payment dang cap nhat");
        }

        ensureOrderCanAcceptPayment(order);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return PaymentCallbackResponse.fromEntity(payment);
        }

        if (request.provider() != null) {
            payment.setProvider(request.provider());
        }
        if (request.transactionNo() != null) {
            payment.setTransactionNo(request.transactionNo());
        }
        if (request.status() != null) {
            payment.setStatus(request.status());
            applyPaymentStatus(order, request.status());
        }
        return PaymentCallbackResponse.fromEntity(payment);
    }

    private void ensureOrderCanAcceptPayment(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Don hang da bi huy, khong the cap nhat thanh toan");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang da duoc van chuyen, khong the cap nhat thanh toan");
        }
        if (order.getPaymentExpiresAt() != null && !order.getPaymentExpiresAt().isAfter(Instant.now())) {
            orderLifecycleService.cancelOrder(order, "Payment window expired");
            throw new BusinessRuleException("Don hang da qua han thanh toan");
        }
    }

    private void applyPaymentStatus(Order order, PaymentStatus status) {
        if (status == PaymentStatus.SUCCESS) {
            orderLifecycleService.confirmAfterSuccessfulPayment(order);
        }
        if (status == PaymentStatus.FAILED) {
            orderLifecycleService.cancelOrder(order, "Payment failed");
        }
    }
}
