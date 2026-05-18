package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.OrderService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository repo;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Override
    public List<OrderResponse> getAllOrders() {
        return repo.findAll().stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(int id) {
        return OrderResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + id)));
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return repo.findByStatus(status).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
        Coupon coupon = null;
        if (request.couponId() != null) {
            coupon = couponRepository.findById(request.couponId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + request.couponId()));
        }
        Order order = Order.builder()
                .user(user)
                .coupon(coupon)
                .subTotal(request.subTotal())
                .discountAmount(request.discountAmount())
                .finalAmount(request.finalAmount())
                .status(request.status() == null ? OrderStatus.PENDING : request.status())
                .shippingAddress(request.shippingAddress())
                .trackingNumber(request.trackingNumber())
                .build();
        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    public OrderResponse updateOrder(int id, OrderRequest request) {
        Order order = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + id));
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
            order.setUser(user);
        }
        if (request.couponId() != null) {
            Coupon coupon = couponRepository.findById(request.couponId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + request.couponId()));
            order.setCoupon(coupon);
        }
        if (request.subTotal() != null) {
            order.setSubTotal(request.subTotal());
        }
        if (request.discountAmount() != null) {
            order.setDiscountAmount(request.discountAmount());
        }
        if (request.finalAmount() != null) {
            order.setFinalAmount(request.finalAmount());
        }
        if (request.status() != null) {
            order.setStatus(request.status());
        }
        if (request.shippingAddress() != null) {
            order.setShippingAddress(request.shippingAddress());
        }
        if (request.trackingNumber() != null) {
            order.setTrackingNumber(request.trackingNumber());
        }
        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    public void deleteOrderById(int id) {
        repo.deleteById(id);
    }
}
