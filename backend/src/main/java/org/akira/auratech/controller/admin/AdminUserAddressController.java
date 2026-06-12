package org.akira.auratech.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.akira.auratech.service.UserAddressService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/user-addresses")
@RequiredArgsConstructor
public class AdminUserAddressController {
    private final UserAddressService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserAddressResponse>> getAllUserAddresses(Pageable pageable) {
        return ResponseEntity.ok(service.getAllUserAddresses(pageable));
    }
}