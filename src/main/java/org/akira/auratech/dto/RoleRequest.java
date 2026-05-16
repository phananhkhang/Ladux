package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.enums.RoleName;

@Getter
@Setter
public class RoleRequest {
    @NotNull(message = "RoleName khong duoc de trong")
    private RoleName name;
}

