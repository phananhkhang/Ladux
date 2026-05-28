package org.akira.auratech.controller;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-histories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OrderHistoryController {
    private final OrderHistoryService service;

    @GetMapping
    public ResponseEntity<List<OrderHistoryResponse>> getAllOrderHistories() {
        return ResponseEntity.ok(service.getAllOrderHistories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderHistoryResponse> getOrderHistoryById(@PathVariable int id) {
        return ResponseEntity.ok(service.getOrderHistoryById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderHistoryResponse>> getOrderHistoriesByOrderId(@PathVariable int orderId) {
        return ResponseEntity.ok(service.getOrderHistoriesByOrderId(orderId));
    }
}
