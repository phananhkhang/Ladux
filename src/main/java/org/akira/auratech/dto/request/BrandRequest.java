package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Tên không được để trống")
        @Size(min = 1, max = 100, message = "Tên thương hiệu phải từ 1 đến 100 ký tự")
        String name,
        String logoUrl
) {}
