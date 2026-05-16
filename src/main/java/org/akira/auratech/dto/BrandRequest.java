package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandRequest {
    @NotBlank(message = "Tên không được để trống")
    @Size(min = 1, max = 100, message = "Tên thương hiệu phải từ 1 đến 100 ký tự")
    private String name;

    private String logoUrl;
}
