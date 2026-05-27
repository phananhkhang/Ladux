package org.akira.auratech.dto.request;

import jakarta.validation.constraints.*;

import java.util.List;

public record UserRequest(
        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong hop le")
        @Size(max = 150, message = "Email khong duoc vuot qua 150 ky tu")
        String email,

        @NotBlank(message = "Username khong duoc de trong")
        @Size(min = 4, max = 60, message = "Username phải từ 4 đến 60 ký tự")
        String username,

        @NotBlank(message = "Password khong duoc de trong")
        @Size(min = 6, max = 100, message = "Password phải từ {min} đến {max} ký tự")
        String password,

        @NotBlank(message = "FullName khong duoc de trong")
        @Size(max = 150, message = "FullName khong duoc vuot qua 150 ky tu")
        String fullName,

        @Size(max = 20, message = "Phone khong duoc vuot qua 20 ky tu")
        String phone,

        @Size(max = 255, message = "Avatar khong duoc vuot qua 255 ky tu")
        String avatar,

        Boolean isActive,

        @NotEmpty(message = "phải có ít nhất 1 role")
        List<@Positive(message = "RoleId phai la so duong") Integer> roleIds
) {}
