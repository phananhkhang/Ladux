package org.akira.auratech.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    public String email;

    @NotBlank(message = "Password không được để trống")
    public String password;

    @NotBlank(message = "Phone không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại Việt Nam không hợp lệ")
    public String phone;

}
