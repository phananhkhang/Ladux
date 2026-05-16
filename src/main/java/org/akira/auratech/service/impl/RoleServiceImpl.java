package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.RoleRequest;
import org.akira.auratech.dto.RoleResponse;
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
    public List<RoleResponse> getAllRoles() {
        return repo.findAll().stream()
                .map(RoleResponse::fromEntity)
                .toList();
    }

    @Override
    public RoleResponse getRoleById(int id) {
        return RoleResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public RoleResponse getRoleByName(RoleName name) {
        return RoleResponse.fromEntity(repo.findByName(name));
    }

    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = Role.builder()
                .name(request.getName())
                .build();
        return RoleResponse.fromEntity(repo.save(role));
    }

    @Override
    public RoleResponse updateRole(int id, RoleRequest request) {
        Role role = repo.findById(id).orElse(null);
        if (role == null) {
            return null;
        }
        if (request.getName() != null) {
            role.setName(request.getName());
        }
        return RoleResponse.fromEntity(repo.save(role));
    }

    @Override
    public void deleteRoleById(int id) {
        repo.deleteById(id);
    }
}
