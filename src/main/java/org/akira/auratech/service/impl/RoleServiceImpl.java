package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.RoleRequest;
import org.akira.auratech.dto.response.RoleResponse;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.repository.RoleRepository;
import org.akira.auratech.service.RoleService;
import org.akira.auratech.exception.ResourceNotFoundException;
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
        return RoleResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay role voi id = " + id)));
    }

    @Override
    public RoleResponse getRoleByName(RoleName name) {
        return RoleResponse.fromEntity(repo.findByName(name));
    }

    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = Role.builder()
                .name(request.name())
                .build();
        return RoleResponse.fromEntity(repo.save(role));
    }

    @Override
    public RoleResponse updateRole(int id, RoleRequest request) {
        Role role = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay role voi id = " + id));
        if (request.name() != null) {
            role.setName(request.name());
        }
        return RoleResponse.fromEntity(repo.save(role));
    }

    @Override
    public void deleteRoleById(int id) {
        repo.deleteById(id);
    }
}
