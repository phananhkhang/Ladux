package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderItemRequest;
import org.akira.auratech.dto.OrderItemResponse;
import org.akira.auratech.service.OrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
public class OrderItemController {
    private final OrderItemService service;

    @GetMapping
    public List<OrderItemResponse> getAllOrderItems() {
        return service.getAllOrderItems();
    }

    @GetMapping("/{id}")
    public OrderItemResponse getOrderItemById(@PathVariable int id) {
        return service.getOrderItemById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItemResponse> getOrderItemsByOrderId(@PathVariable int orderId) {
        return service.getOrderItemsByOrderId(orderId);
    }

    @PostMapping
    public ResponseEntity<OrderItemResponse> createOrderItem(@Valid @RequestBody OrderItemRequest request) {
        return ResponseEntity.ok(service.createOrderItem(request));
    }

    @PutMapping("/{id}")
    public OrderItemResponse updateOrderItem(@PathVariable int id, @RequestBody OrderItemRequest request) {
        return service.updateOrderItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderItemById(@PathVariable int id) {
        service.deleteOrderItemById(id);
    }
}
