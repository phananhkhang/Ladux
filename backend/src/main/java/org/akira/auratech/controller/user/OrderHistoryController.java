package org.akira.auratech.controller.user;


import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/order-histories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OrderHistoryController {
    private final OrderHistoryService service;

    // Xem tất cả lịch sử đơn hàng của chính user đó, không được xem của user khác.
    @GetMapping("/my")
    public ResponseEntity<Page<OrderHistoryResponse>> getOrdersHistoryByUser(@AuthenticationPrincipal UserPrincipal userPrincipal, Pageable pageable) {
        return ResponseEntity.ok(service.getOrdersHistoryByUser(userPrincipal.getId(), pageable));
    }
}
