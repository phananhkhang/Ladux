package org.akira.ladux.dto.user.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @Size(min = 6, max = 100, message = "Mat khau phai tu 6 den 100 ky tu")
        String password,

        @Size(max = 150, message = "Ho ten khong duoc vuot qua 150 ky tu")
        String fullName,

        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        @Size(max = 20, message = "Phone khong duoc vuot qua 20 ky tu")
        String phone,

        @Size(max = 255, message = "Avatar khong duoc vuot qua 255 ky tu")
        String avatarUrl
) {
}
