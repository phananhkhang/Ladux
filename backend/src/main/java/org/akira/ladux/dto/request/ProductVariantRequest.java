package org.akira.ladux.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductVariantRequest {
    private Integer productId;
    private Integer colorId;
    private String ram;
    private String rom;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private int stockQuantity;
    private boolean isActive;
}
