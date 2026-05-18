package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.PaymentRequest;
import org.akira.auratech.dto.response.PaymentResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.service.PaymentService;
import org.akira.auratech.exception.ResourceNotFoundException;
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
        return PaymentResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id)));
    }

    @Override
    public PaymentResponse getPaymentByOrderId(int orderId) {
        Payment payment = repo.findByOrderId(orderId);
        if (payment == null) {
            throw new ResourceNotFoundException("Khong tim thay payment voi orderId = " + orderId);
        }
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        return repo.findByStatus(status).stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
        if (order == null) {
            return null;
        }
        Payment payment = Payment.builder()
                .order(order)
                .provider(request.provider())
                .transactionNo(request.transactionNo())
                .amount(request.amount())
                .status(request.status() == null ? PaymentStatus.PENDING : request.status())
                .build();
        return PaymentResponse.fromEntity(repo.save(payment));
    }

    @Override
    public PaymentResponse updatePayment(int id, PaymentRequest request) {
        Payment payment = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id));
        if (request.orderId() != null) {
            Order order = orderRepository.findById(request.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
            payment.setOrder(order);
        }
        if (request.provider() != null) {
            payment.setProvider(request.provider());
        }
        if (request.transactionNo() != null) {
            payment.setTransactionNo(request.transactionNo());
        }
        if (request.amount() != null) {
            payment.setAmount(request.amount());
        }
        if (request.status() != null) {
            payment.setStatus(request.status());
        }
        return PaymentResponse.fromEntity(repo.save(payment));
    }

    @Override
    public void deletePaymentById(int id) {
        repo.deleteById(id);
    }
}
