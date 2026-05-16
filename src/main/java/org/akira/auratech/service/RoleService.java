package org.akira.auratech.service;

import org.akira.auratech.dto.RoleRequest;
import org.akira.auratech.dto.RoleResponse;
import org.akira.auratech.model.enums.RoleName;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(int id);

    RoleResponse getRoleByName(RoleName name);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(int id, RoleRequest request);

    void deleteRoleById(int id);
}
