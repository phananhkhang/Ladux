package org.akira.ladux.service;

import org.akira.ladux.catalog.domain.model.Color;
import org.akira.ladux.dto.catalog.response.ProductVariantResponse;

import java.math.BigDecimal;

public interface ProductVariantService {
    ProductVariantResponse addProductVariant(Integer productId, Integer colorId, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active);

    ProductVariantResponse updateProductVariant(Integer id, Integer colorId, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active);

    void deleteProductVariant(Integer variantId);
}
