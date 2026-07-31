package org.akira.ladux.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.user.OrderHistoryResponse;
import org.akira.ladux.service.OrderHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/order-histories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderHistoryController {
    private final OrderHistoryService service;

    @GetMapping
    public ResponseEntity<Page<OrderHistoryResponse>> getAllOrderHistories(Pageable pageable) {
        return ResponseEntity.ok(service.getAllOrderHistories(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderHistoryResponse> getOrderHistoryById(@PathVariable int id) {
        return ResponseEntity.ok(service.getOrderHistoryById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Page<OrderHistoryResponse>> getOrderHistoriesByOrderId(@PathVariable int orderId, Pageable pageable) {
        return ResponseEntity.ok(service.getOrderHistoriesByOrderId(orderId, pageable));
    }
}
