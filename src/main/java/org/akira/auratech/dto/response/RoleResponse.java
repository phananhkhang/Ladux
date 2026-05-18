package org.akira.auratech.dto.response;

import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;

public record RoleResponse(
        Integer id,
        RoleName name
) {
    public static RoleResponse fromEntity(Role role) {
        if (role == null) {
            return null;
        }
        return new RoleResponse(
                role.getId(),
                role.getName()
        );
    }
}
