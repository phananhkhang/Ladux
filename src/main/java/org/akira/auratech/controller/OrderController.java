package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.response.OrderResponse;
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

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable int id) {
        return ResponseEntity.ok(service.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getOrdersByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(service.getOrdersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return new ResponseEntity<>(service.createOrder(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable int id, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(service.updateOrder(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderById(@PathVariable int id) {
        service.deleteOrderById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
