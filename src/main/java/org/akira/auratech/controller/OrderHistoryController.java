package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderHistoryRequest;
import org.akira.auratech.dto.OrderHistoryResponse;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-histories")
@RequiredArgsConstructor
public class OrderHistoryController {
    private final OrderHistoryService service;

    @GetMapping
    public List<OrderHistoryResponse> getAllOrderHistories() {
        return service.getAllOrderHistories();
    }

    @GetMapping("/{id}")
    public OrderHistoryResponse getOrderHistoryById(@PathVariable int id) {
        return service.getOrderHistoryById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderHistoryResponse> getOrderHistoriesByOrderId(@PathVariable int orderId) {
        return service.getOrderHistoriesByOrderId(orderId);
    }

    @PostMapping
    public ResponseEntity<OrderHistoryResponse> createOrderHistory(@Valid @RequestBody OrderHistoryRequest request) {
        return ResponseEntity.ok(service.createOrderHistory(request));
    }

    @PutMapping("/{id}")
    public OrderHistoryResponse updateOrderHistory(@PathVariable int id, @RequestBody OrderHistoryRequest request) {
        return service.updateOrderHistory(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderHistoryById(@PathVariable int id) {
        service.deleteOrderHistoryById(id);
    }
}
