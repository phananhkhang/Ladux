package org.akira.auratech.dto.response;

import org.akira.auratech.dto.request.ProductRequest;
import org.akira.auratech.model.CartItem;
import org.akira.auratech.model.Product;

public record CartItemResponse(
        Integer id,
        ProductResponse product,
        int quantity
) {
    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return new CartItemResponse(
                item.getId(),
                item.getProduct() == null ? null : ProductResponse.fromEntity(item.getProduct()),
                item.getQuantity()
        );
    }
}
