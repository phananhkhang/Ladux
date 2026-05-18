package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderHistoryRequest;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-histories")
@RequiredArgsConstructor
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

    @PostMapping
    public ResponseEntity<OrderHistoryResponse> createOrderHistory(@Valid @RequestBody OrderHistoryRequest request) {
        return new ResponseEntity<>(service.createOrderHistory(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderHistoryResponse> updateOrderHistory(@PathVariable int id, @Valid @RequestBody OrderHistoryRequest request) {
        return ResponseEntity.ok(service.updateOrderHistory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderHistoryById(@PathVariable int id) {
        service.deleteOrderHistoryById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
