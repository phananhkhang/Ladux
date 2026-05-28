package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Ten khong duoc de trong")
        @Size(min = 1, max = 100, message = "Ten thuong hieu phai tu 1 den 100 ky tu")
        String name,

        @Size(max = 255, message = "LogoUrl khong duoc vuot qua 255 ky tu")
        String logoUrl
) {}
