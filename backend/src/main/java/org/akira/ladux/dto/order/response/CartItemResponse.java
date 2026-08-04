package org.akira.ladux.dto.order.response;

import org.akira.ladux.model.CartItem;

import java.io.Serializable;

import org.akira.ladux.dto.catalog.response.ProductResponse;
import org.akira.ladux.dto.catalog.response.ProductVariantResponse;
public record CartItemResponse(
        Integer id,
        ProductResponse product,
        ProductVariantResponse productVariant,
        int quantity
) implements Serializable {
    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getId(),
                item.getProductVariant() == null ? null : ProductResponse.summaryFromEntity(item.getProductVariant().getProduct()),
                ProductVariantResponse.fromEntity(item.getProductVariant()),
                item.getQuantity()
        );
    }
}
