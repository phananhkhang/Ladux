package org.akira.auratech.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Ho va ten khong duoc de trong")
        @Size(min = 2, max = 50, message = "Ho ten phai tu 2 den 50 ky tu")
        String fullName,

        @NotBlank(message = "Username khong duoc de trong")
        @Size(min = 4, max = 60, message = "Username phai tu 4 den 60 ky tu")
        String username,

        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong dung dinh dang")
        @Size(max = 150, message = "Email khong duoc vuot qua 150 ky tu")
        String email,

        @NotBlank(message = "Mat khau khong duoc de trong")
        @Size(min = 6, max = 100, message = "Mat khau phai tu 6 den 100 ky tu")
        String password,

        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        String phone
) {}
