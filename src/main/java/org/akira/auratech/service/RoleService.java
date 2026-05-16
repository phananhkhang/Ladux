package org.akira.auratech.service;

import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;

import java.util.List;

public interface RoleService {
    List<Role> getAllRoles();

    Role getRoleById(int id);

    Role getRoleByName(RoleName name);

    Role createRole(Role role);

    Role updateRole(Role role);

    void deleteRoleById(int id);
}
