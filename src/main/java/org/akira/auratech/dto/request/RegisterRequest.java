package org.akira.auratech.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size; // 💡 Tui import thêm cái này để khống chế độ dài mật khẩu nha Khang

public record RegisterRequest(
        @NotBlank(message = "Ho va ten khong duoc de trong")
        @Size(min = 2, max = 50, message = "Ho ten phai tu 2 den 50 ky tu")
        String fullName,

        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong dung dinh dang")
        String email,

        @NotBlank(message = "Mat khau khong duoc de trong")
        @Size(min = 6, max = 32, message = "Mat khau phai tu 6 den 32 ky tu")
        String password,

        @NotBlank(message = "So dien thoai khong duoc de trong")
        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        String phoneNumber
) {}