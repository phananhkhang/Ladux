package org.akira.ladux.dto.user.request;

import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @Size(max = 150, message = "Ho ten khong duoc vuot qua 150 ky tu")
        String fullName,

        String phone,

        String email,

        // --- Cac truong mat khau khong dung @NotBlank, de null/blank neu user khong doi ---
        String currentPassword,
        String newPassword,
        String confirmPassword
) {
}
