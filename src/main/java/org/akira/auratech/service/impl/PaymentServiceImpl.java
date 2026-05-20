package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentCallbackRequest;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository repo;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentCallbackResponse> getAllPayments() {
        return repo.findAll().stream()
                .map(PaymentCallbackResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentCallbackResponse getPaymentById(int id) {
        return PaymentCallbackResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentCallbackResponse> getPaymentsByOrderId(int orderId) {
        return repo.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(PaymentCallbackResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status) {
        return repo.findByStatus(status).stream()
                .map(PaymentCallbackResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public PaymentCallbackResponse createPayment(PaymentCallbackRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
        repo.findFirstByOrderIdOrderByCreatedAtDesc(order.getId()).ifPresent(lastPayment -> {
            if (lastPayment.getStatus() != PaymentStatus.FAILED) {
                throw new BusinessRuleException("Chi tao payment attempt moi khi lan truoc FAILED");
            }
        });

        Payment payment = Payment.builder()
                .order(order)
                .provider(request.provider())
                .transactionNo(request.transactionNo())
                .amount(order.getFinalAmount())
                .status(request.status() == null ? PaymentStatus.PENDING : request.status())
                .build();
        return PaymentCallbackResponse.fromEntity(repo.save(payment));
    }

    @Override
    @Transactional
    public PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request) {
        Payment payment = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id));
        if (!payment.getOrder().getId().equals(request.orderId())) {
            throw new BusinessRuleException("OrderId khong khop voi payment dang cap nhat");
        }
        if (request.provider() != null) {
            payment.setProvider(request.provider());
        }
        if (request.transactionNo() != null) {
            payment.setTransactionNo(request.transactionNo());
        }
        if (request.status() != null) {
            payment.setStatus(request.status());
        }
        return PaymentCallbackResponse.fromEntity(payment);
    }

    @Override
    @Transactional
    public void deletePaymentById(int id) {
        repo.deleteById(id);
    }
}
