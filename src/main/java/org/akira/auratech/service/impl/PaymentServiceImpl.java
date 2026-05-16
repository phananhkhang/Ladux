package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.PaymentRequest;
import org.akira.auratech.dto.PaymentResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.PaymentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository repo;
    private final OrderRepository orderRepository;

    @Override
    public List<PaymentResponse> getAllPayments() {
        return repo.findAll().stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    public PaymentResponse getPaymentById(int id) {
        return PaymentResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public PaymentResponse getPaymentByOrderId(int orderId) {
        return PaymentResponse.fromEntity(repo.findByOrderId(orderId));
    }

    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        return repo.findByStatus(status).stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId()).orElse(null);
        if (order == null) {
            return null;
        }
        Payment payment = Payment.builder()
                .order(order)
                .provider(request.getProvider())
                .transactionNo(request.getTransactionNo())
                .amount(request.getAmount())
                .status(request.getStatus() == null ? PaymentStatus.PENDING : request.getStatus())
                .build();
        return PaymentResponse.fromEntity(repo.save(payment));
    }

    @Override
    public PaymentResponse updatePayment(int id, PaymentRequest request) {
        Payment payment = repo.findById(id).orElse(null);
        if (payment == null) {
            return null;
        }
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId()).orElse(null);
            if (order == null) {
                return null;
            }
            payment.setOrder(order);
        }
        if (request.getProvider() != null) {
            payment.setProvider(request.getProvider());
        }
        if (request.getTransactionNo() != null) {
            payment.setTransactionNo(request.getTransactionNo());
        }
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }
        return PaymentResponse.fromEntity(repo.save(payment));
    }

    @Override
    public void deletePaymentById(int id) {
        repo.deleteById(id);
    }
}
