package org.akira.ladux.controller.admin;

import org.akira.ladux.dto.inventory.request.PurchaseOrderCreateRequest;
import org.akira.ladux.dto.inventory.request.AdminPurchaseOrderReceiveRequest;
import org.akira.ladux.dto.inventory.request.PurchaseOrderStatusUpdateRequest;
import org.akira.ladux.dto.inventory.response.PurchaseOrderResponse;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.model.enums.PurchaseOrderStatus;
import org.akira.ladux.service.PurchaseOrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPurchaseOrderController {

    private final PurchaseOrderService service;

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponse>> getAllPurchaseOrders(Pageable pageable) {
        return ResponseEntity.ok(service.getAllPurchaseOrders(pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<PurchaseOrderResponse>> getByStatus(
            @PathVariable PurchaseOrderStatus status, Pageable pageable) {
        return ResponseEntity.ok(service.getPurchaseOrdersByStatus(status, pageable));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<Page<PurchaseOrderResponse>> getBySupplier(
            @PathVariable int supplierId, Pageable pageable) {
        return ResponseEntity.ok(service.getPurchaseOrdersBySupplier(supplierId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable int id) {
        return ResponseEntity.ok(service.getPurchaseOrderById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PurchaseOrderCreateRequest request) {
        return new ResponseEntity<>(service.createPurchaseOrder(request, principal.getId()), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponse> updateStatus(
            @PathVariable int id, @Valid @RequestBody PurchaseOrderStatusUpdateRequest request) {
        return ResponseEntity.ok(service.updateStatus(id, request));
    }

    @PostMapping("/{id}/receive") // API để nhập kho/ nhập hàng
    public ResponseEntity<PurchaseOrderResponse> receive(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int id,
            @Valid @RequestBody AdminPurchaseOrderReceiveRequest request) {
        return ResponseEntity.ok(service.receiveGoods(id, request, principal.getId()));
    }
}
