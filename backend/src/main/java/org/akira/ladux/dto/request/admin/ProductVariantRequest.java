package org.akira.ladux.dto.request.admin;

import java.math.BigDecimal;

public record ProductVariantRequest(
        Integer productId,
        Integer colorId,
        String ram,
        String rom,
        BigDecimal price,
        BigDecimal discountPrice,
        int stockQuantity,
        boolean isActive
) {

}
