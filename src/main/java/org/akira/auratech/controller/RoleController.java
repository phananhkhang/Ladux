package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.RoleRequest;
import org.akira.auratech.dto.RoleResponse;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService service;

    @GetMapping
    public List<RoleResponse> getAllRoles() {
        return service.getAllRoles();
    }

    @GetMapping("/{id}")
    public RoleResponse getRoleById(@PathVariable int id) {
        return service.getRoleById(id);
    }

    @GetMapping("/name/{name}")
    public RoleResponse getRoleByName(@PathVariable RoleName name) {
        return service.getRoleByName(name);
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(service.createRole(request));
    }

    @PutMapping("/{id}")
    public RoleResponse updateRole(@PathVariable int id, @RequestBody RoleRequest request) {
        return service.updateRole(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteRoleById(@PathVariable int id) {
        service.deleteRoleById(id);
    }
}
