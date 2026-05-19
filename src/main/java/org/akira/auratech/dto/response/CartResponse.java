package org.akira.auratech.dto.response;

import org.akira.auratech.model.Cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Integer id,
        Integer userId,
        List<CartItemResponse> items,
        BigDecimal totalPrice
) {
    public static CartResponse fromEntity(Cart cart) {
        if (cart == null) {
            return null;
        }
        List<Integer> itemIds = cart.getItems() == null ? List.of() : cart.getItems().stream()
                .map(item -> item.getId())
                .toList();
        return new CartResponse(
                cart.getId(),
                cart.getUser() == null ? null : cart.getUser().getId(),
                cart.getItems() == null ? List.of() : cart.getItems().stream()
                        .map(CartItemResponse::fromEntity)
                        .toList(),
                BigDecimal.ZERO
        );
    }
}
