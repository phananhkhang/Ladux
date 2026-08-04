package org.akira.ladux.dto.user.response;

import org.akira.ladux.model.Role;

public record RoleResponse(
        Integer id,
        String name
) {
    public static RoleResponse fromEntity(Role role) {
        return new RoleResponse(role.getId(), role.getName().name());
    }
}
