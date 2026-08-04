package org.akira.ladux.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.user.response.RoleResponse;
import org.akira.ladux.repository.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {
    private final RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll().stream()
                .map(RoleResponse::fromEntity)
                .toList());
    }
}
