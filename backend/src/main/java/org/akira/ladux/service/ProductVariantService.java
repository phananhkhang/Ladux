package org.akira.ladux.service;

import org.akira.ladux.dto.response.ProductVariantResponse;
import org.akira.ladux.model.Color;

import java.math.BigDecimal;

public interface ProductVariantService {
    ProductVariantResponse addProductVariant(Integer productId, Integer colorId, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active);

    ProductVariantResponse updateProductVariant(Integer id, Integer colorId, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active);

    void deleteProductVariant(Integer variantId);
}
