package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UserRequest(
        @NotBlank(message = "Email khong duoc de trong")
        String email,
        @NotBlank(message = "Password khong duoc de trong")
        String passwordHash,
        @NotBlank(message = "FullName khong duoc de trong")
        String fullName,
        String phone,
        String avatar,
        Boolean isActive,
        List<Integer> roleIds
) {}
