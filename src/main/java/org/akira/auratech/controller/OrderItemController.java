package org.akira.auratech.controller;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderItemResponse;
import org.akira.auratech.service.OrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
