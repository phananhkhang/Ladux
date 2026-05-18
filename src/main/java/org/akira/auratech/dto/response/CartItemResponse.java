package org.akira.auratech.dto.response;

import org.akira.auratech.model.CartItem;

public record CartItemResponse(
        Integer id,
        Integer cartId,
        Integer productId,
        int quantity
) {
    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getId(),
                item.getCart() == null ? null : item.getCart().getId(),
                item.getProduct() == null ? null : item.getProduct().getId(),
                item.getQuantity()
        );
    }
}
