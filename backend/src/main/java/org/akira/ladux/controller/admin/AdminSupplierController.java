package org.akira.ladux.controller.admin;

import org.akira.ladux.dto.inventory.request.SupplierRequest;
import org.akira.ladux.dto.inventory.response.SupplierResponse;
import org.akira.ladux.service.SupplierService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Page<SupplierResponse>> searchSuppliers(String name, String phone, Pageable pabable) {
        return ResponseEntity.ok(service.searchSuppliers(name, phone, pabable));
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
