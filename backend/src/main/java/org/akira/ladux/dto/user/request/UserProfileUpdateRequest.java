package org.akira.ladux.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Ho ten khong duoc de trong")
        @Size(max = 150, message = "Ho ten khong duoc vuot qua 150 ky tu")
        String fullName,

        @NotBlank(message = "So dien thoai khong duoc de trong")
        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        String phone,

        // --- Cac truong mat khau khong dung @NotBlank, de null/blank neu user khong doi ---
        String currentPassword,
        String newPassword,
        String confirmPassword
) {
}
