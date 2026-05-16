package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;

@Getter
@Setter
@Builder
public class RoleResponse {
    private Integer id;
    private RoleName name;

    public static RoleResponse fromEntity(Role role) {
        if (role == null) {
            return null;
        }
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }
}

