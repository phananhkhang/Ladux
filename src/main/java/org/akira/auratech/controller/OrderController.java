package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@RequestHeader("X-User-Id") int userId, @PathVariable int orderId) {
        return ResponseEntity.ok(service.getOrderById(userId, orderId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@RequestHeader("X-User-Id") int userId) {
        return ResponseEntity.ok(service.getOrdersByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(service.getOrdersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestHeader("X-User-Id") int userId, @Valid @RequestBody OrderRequest request) {
        return new ResponseEntity<>(service.createOrder(userId, request), HttpStatus.CREATED);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @RequestHeader("X-User-Id") int userId,
            @PathVariable int orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(service.updateOrderStatus(userId, orderId, request));
    }

    @PostMapping("/{orderId}/payments/retry")
    public ResponseEntity<PaymentCallbackResponse> retryPayment(
            @RequestHeader("X-User-Id") int userId,
            @PathVariable int orderId
    ) {
        return new ResponseEntity<>(service.retryPayment(userId, orderId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrderById(@RequestHeader("X-User-Id") int userId, @PathVariable int orderId) {
        service.deleteOrderById(userId, orderId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
