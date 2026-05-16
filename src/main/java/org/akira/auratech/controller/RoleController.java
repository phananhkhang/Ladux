package org.akira.auratech.controller;

import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
public class RoleController {
    @Autowired
    RoleService service;

    @GetMapping("/all")
    public List<Role> getAllRoles() {
        return service.getAllRoles();
    }

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable int id) {
        return service.getRoleById(id);
    }

    @GetMapping("/name/{name}")
    public Role getRoleByName(@PathVariable RoleName name) {
        return service.getRoleByName(name);
    }

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return service.createRole(role);
    }

    @PutMapping
    public Role updateRole(@RequestBody Role role) {
        return service.updateRole(role);
    }

    @DeleteMapping("/{id}")
    public void deleteRoleById(@PathVariable int id) {
        service.deleteRoleById(id);
    }
}

