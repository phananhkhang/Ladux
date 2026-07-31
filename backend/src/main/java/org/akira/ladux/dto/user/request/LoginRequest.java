package org.akira.ladux.dto.user.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Username khong duoc de trong")
        String username,
        @NotBlank(message = "Password khong duoc de trong")
        String password
) {

}
