package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.CartItem;

@Getter
@Setter
@Builder
public class CartItemResponse {
    private Integer id;
    private Integer cartId;
    private Integer productId;
    private int quantity;

    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null) {
            return null;
        }
        return CartItemResponse.builder()
                .id(item.getId())
                .cartId(item.getCart() == null ? null : item.getCart().getId())
                .productId(item.getProduct() == null ? null : item.getProduct().getId())
                .quantity(item.getQuantity())
                .build();
    }
}

