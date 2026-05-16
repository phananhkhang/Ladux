package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderRequest;
import org.akira.auratech.dto.OrderResponse;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.OrderService;
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
        return OrderResponse.fromEntity(repo.findById(id).orElse(null));
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
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            return null;
        }
        Coupon coupon = null;
        if (request.getCouponId() != null) {
            coupon = couponRepository.findById(request.getCouponId()).orElse(null);
            if (coupon == null) {
                return null;
            }
        }
        Order order = Order.builder()
                .user(user)
                .coupon(coupon)
                .subTotal(request.getSubTotal())
                .discountAmount(request.getDiscountAmount())
                .finalAmount(request.getFinalAmount())
                .status(request.getStatus() == null ? OrderStatus.PENDING : request.getStatus())
                .shippingAddress(request.getShippingAddress())
                .trackingNumber(request.getTrackingNumber())
                .build();
        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    public OrderResponse updateOrder(int id, OrderRequest request) {
        Order order = repo.findById(id).orElse(null);
        if (order == null) {
            return null;
        }
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return null;
            }
            order.setUser(user);
        }
        if (request.getCouponId() != null) {
            Coupon coupon = couponRepository.findById(request.getCouponId()).orElse(null);
            if (coupon == null) {
                return null;
            }
            order.setCoupon(coupon);
        }
        if (request.getSubTotal() != null) {
            order.setSubTotal(request.getSubTotal());
        }
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getFinalAmount() != null) {
            order.setFinalAmount(request.getFinalAmount());
        }
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        if (request.getShippingAddress() != null) {
            order.setShippingAddress(request.getShippingAddress());
        }
        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    public void deleteOrderById(int id) {
        repo.deleteById(id);
    }
}
