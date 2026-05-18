package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import org.akira.auratech.model.enums.RoleName;

public record RoleRequest(
        @NotNull(message = "RoleName khong duoc de trong")
        RoleName name
) {}
