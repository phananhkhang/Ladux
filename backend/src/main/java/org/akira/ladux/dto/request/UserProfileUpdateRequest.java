package org.akira.ladux.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @Email(message = "Email khong hop le")
        @Size(max = 150, message = "Email khong duoc vuot qua 150 ky tu")
        String email,

        @Size(min = 4, max = 60, message = "Username phai tu 4 den 60 ky tu")
        String username,

        @Size(min = 6, max = 100, message = "Password phai tu 6 den 100 ky tu")
        String password,

        @Size(max = 150, message = "FullName khong duoc vuot qua 150 ky tu")
        String fullName,

        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        @Size(max = 20, message = "Phone khong duoc vuot qua 20 ky tu")
        String phone
) {}