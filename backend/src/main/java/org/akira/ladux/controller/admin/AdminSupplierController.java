package org.akira.ladux.controller.admin;

import org.akira.ladux.dto.inventory.request.SupplierRequest;
import org.akira.ladux.dto.inventory.response.SupplierResponse;
import org.akira.ladux.service.SupplierService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupplierController {

    private final SupplierService service;

    @GetMapping
    public ResponseEntity<Page<SupplierResponse>> getAllSuppliers(Pageable pageable) {
        return ResponseEntity.ok(service.getAllSuppliers(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<Page<SupplierResponse>> getActive(Pageable pageable) {
        return ResponseEntity.ok(service.getActiveSuppliers(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable int id) {
        return ResponseEntity.ok(service.getSupplierById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SupplierResponse>> searchSuppliers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            Pageable pageable) {
        return ResponseEntity.ok(service.searchSuppliers(name, phone, pageable));
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return new ResponseEntity<>(service.createSupplier(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable int id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(service.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable int id) {
        service.deleteSupplierById(id);
        return ResponseEntity.noContent().build();
    }
}
