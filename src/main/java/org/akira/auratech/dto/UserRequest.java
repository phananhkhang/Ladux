package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRequest {
    @NotBlank(message = "Email khong duoc de trong")
    private String email;

    @NotBlank(message = "Password khong duoc de trong")
    private String passwordHash;

    @NotBlank(message = "FullName khong duoc de trong")
    private String fullName;

    private String phone;

    private String avatar;

    private Boolean isActive;

    private List<Integer> roleIds;
}

