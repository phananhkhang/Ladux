package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderItemRequest;
import org.akira.auratech.dto.OrderItemResponse;
import org.akira.auratech.service.OrderItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
public class OrderItemController {
    private final OrderItemService service;

    @GetMapping
    public ResponseEntity<List<OrderItemResponse>> getAllOrderItems() {
        return ResponseEntity.ok(service.getAllOrderItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemResponse> getOrderItemById(@PathVariable int id) {
        return ResponseEntity.ok(service.getOrderItemById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemResponse>> getOrderItemsByOrderId(@PathVariable int orderId) {
        return ResponseEntity.ok(service.getOrderItemsByOrderId(orderId));
    }

    @PostMapping
    public ResponseEntity<OrderItemResponse> createOrderItem(@Valid @RequestBody OrderItemRequest request) {
        return new ResponseEntity<>(service.createOrderItem(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderItemResponse> updateOrderItem(@PathVariable int id, @Valid @RequestBody OrderItemRequest request) {
        return ResponseEntity.ok(service.updateOrderItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItemById(@PathVariable int id) {
        service.deleteOrderItemById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
