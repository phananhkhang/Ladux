package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.RoleRequest;
import org.akira.auratech.dto.response.RoleResponse;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.service.RoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService service;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(service.getAllRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable int id) {
        return ResponseEntity.ok(service.getRoleById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<RoleResponse> getRoleByName(@PathVariable RoleName name) {
        return ResponseEntity.ok(service.getRoleByName(name));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        return new ResponseEntity<>(service.createRole(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(@PathVariable int id, @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(service.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoleById(@PathVariable int id) {
        service.deleteRoleById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
