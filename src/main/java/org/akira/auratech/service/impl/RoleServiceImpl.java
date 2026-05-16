package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.repository.RoleRepository;
import org.akira.auratech.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository repo;

    @Override
    public List<Role> getAllRoles() {
        return repo.findAll();
    }

    @Override
    public Role getRoleById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Role getRoleByName(RoleName name) {
        return repo.findByName(name);
    }

    @Override
    public Role createRole(Role role) {
        return repo.save(role);
    }

    @Override
    public Role updateRole(Role role) {
        return repo.save(role);
    }

    @Override
    public void deleteRoleById(int id) {
        repo.deleteById(id);
    }
}

