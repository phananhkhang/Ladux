package org.akira.auratech.controller.admin;

import org.akira.auratech.dto.request.StockMovementRequest;
import org.akira.auratech.dto.response.StockMovementResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.service.StockMovementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/stock-movements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStockMovementController {

    private final StockMovementService service;

    @GetMapping
    public ResponseEntity<Page<StockMovementResponse>> getAllStockMovements(Pageable pageable) {
        return ResponseEntity.ok(service.getAllMovements(pageable));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<StockMovementResponse>> getByProduct(@PathVariable int productId, Pageable pageable) {
        return ResponseEntity.ok(service.getMovementsByProduct(productId, pageable));
    }

    /** Tao bien dong kho thu cong (dieu chinh kiem ke, hang hong...). */
    @PostMapping("/adjustments")
    public ResponseEntity<StockMovementResponse> createAdjustment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockMovementRequest request) {
        return new ResponseEntity<>(service.createAdjustment(request, principal.getId()), HttpStatus.CREATED);
    }
}
