package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.order.request.OrderRequest;
import org.akira.ladux.dto.order.response.OrderResponse;
import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// API don hang cho khach hang (CUSTOMER).
// userId luon lay tu UserPrincipal — khong tin tham so client (chong IDOR).
// POST /orders doc gio hang server-side, client chi gui dia chi + coupon + provider.
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    // Chi tiet mot don — chi chu don moi xem duoc (kiem tra o service layer).
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@AuthenticationPrincipal UserPrincipal principal, @PathVariable int orderId) {
        return ResponseEntity.ok(service.getOrderById(principal.getId(), orderId));
    }

    @GetMapping("/user")
    public ResponseEntity<Page<OrderResponse>> getOrdersByUserId(@AuthenticationPrincipal UserPrincipal principal, Pageable pageable) {
        return ResponseEntity.ok(service.getOrdersByUserId(principal.getId(), pageable));
    }

    // Tao don tu gio hang hien tai — logic nghiep vu o OrderService.createOrder.
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody OrderRequest request) {
        return new ResponseEntity<>(service.createOrder(principal.getId(), request), HttpStatus.CREATED);
    }

    @PostMapping("/{orderId}/payments/retry")
    public ResponseEntity<PaymentCallbackResponse> retryPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int orderId
    ) {
        return new ResponseEntity<>(service.retryPayment(principal.getId(), orderId), HttpStatus.CREATED);
    }
}