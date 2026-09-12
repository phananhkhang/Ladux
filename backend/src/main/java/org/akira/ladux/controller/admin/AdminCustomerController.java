package org.akira.ladux.controller.admin;

import org.akira.ladux.dto.user.request.AdminCustomerUpdateRequest;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.model.enums.CustomerLevel;
import org.akira.ladux.service.CustomerService;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final CustomerService service;

    @GetMapping
    public ResponseEntity<PageResponse<CustomerResponse>> getAllCustomers(Pageable pageable) {
        return ResponseEntity.ok(service.getAllCustomers(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<CustomerResponse>> searchCustomers(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String phone,
        Pageable pageable) {

    return ResponseEntity.ok(service.searchCustomers(name, phone, pageable));
}

    @GetMapping("/level/{level}")
    public ResponseEntity<PageResponse<CustomerResponse>> getByLevel(@PathVariable CustomerLevel level, Pageable pageable) {
        return ResponseEntity.ok(service.getCustomersByLevel(level, pageable));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getByUserId(@PathVariable int customerId) {
        return ResponseEntity.ok(service.getCustomerByUserId(customerId));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable int customerId, @Valid @RequestBody AdminCustomerUpdateRequest request) {
        return ResponseEntity.ok(service.updateCustomer(customerId, request));
    }
}
