package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageRequest {
    @NotNull(message = "ProductId khong duoc de trong")
    private Integer productId;

    @NotBlank(message = "ImageUrl khong duoc de trong")
    private String imageUrl;

    private Boolean isPrimary;
}
