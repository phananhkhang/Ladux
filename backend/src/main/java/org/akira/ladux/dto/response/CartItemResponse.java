package org.akira.ladux.dto.response;

import org.akira.ladux.model.CartItem;

import java.io.Serializable;

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
                item.getProduct() == null ? null : ProductResponse.summaryFromEntity(item.getProduct()),
                item.getQuantity()
        );
    }
}
