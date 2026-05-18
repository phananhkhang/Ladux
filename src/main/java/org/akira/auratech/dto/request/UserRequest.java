package org.akira.auratech.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UserRequest(
        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong hop le")
        @Size(max = 150, message = "Email khong duoc vuot qua 150 ky tu")
        String email,

        @NotBlank(message = "Password khong duoc de trong")
        String passwordHash,

        @NotBlank(message = "FullName khong duoc de trong")
        @Size(max = 150, message = "FullName khong duoc vuot qua 150 ky tu")
        String fullName,

        @Size(max = 20, message = "Phone khong duoc vuot qua 20 ky tu")
        String phone,

        @Size(max = 255, message = "Avatar khong duoc vuot qua 255 ky tu")
        String avatar,

        Boolean isActive,

        List<@Positive(message = "RoleId phai la so duong") Integer> roleIds
) {}
