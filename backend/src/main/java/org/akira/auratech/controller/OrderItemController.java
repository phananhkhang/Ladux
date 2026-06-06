package org.akira.auratech.controller;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderItemResponse;
import org.akira.auratech.service.OrderItemService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OrderItemController {
    private final OrderItemService service;

    @GetMapping
    public ResponseEntity<Page<OrderItemResponse>> getAllOrderItems(Pageable pageable) {
        return ResponseEntity.ok(service.getAllOrderItems(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemResponse> getOrderItemById(@PathVariable int id) {
        return ResponseEntity.ok(service.getOrderItemById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Page<OrderItemResponse>> getOrderItemsByOrderId(@PathVariable int orderId, Pageable pageable) {
        return ResponseEntity.ok(service.getOrderItemsByOrderId(orderId, pageable));
    }
}
