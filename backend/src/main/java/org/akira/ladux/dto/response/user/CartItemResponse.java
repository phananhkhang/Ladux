package org.akira.ladux.dto.response.user;

import org.akira.ladux.model.CartItem;

import java.io.Serializable;

import org.akira.ladux.dto.response.common.ProductResponse;
public record CartItemResponse(
        Integer id,
        ProductResponse product,
        int quantity
) implements Serializable {
    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getId(),
                item.getProductVariant() == null ? null : ProductResponse.summaryFromEntity(item.getProductVariant().getProduct()),
                item.getQuantity()
        );
    }
}
