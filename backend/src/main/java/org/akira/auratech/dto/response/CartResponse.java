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
        BigDecimal totalPrice = cart.getItems() == null ? BigDecimal.ZERO : cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getDiscountPrice() == null
                            ? item.getProduct().getBasePrice()
                            : item.getProduct().getDiscountPrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(
                cart.getId(),
                cart.getUser() == null ? null : cart.getUser().getId(),
                cart.getItems() == null ? List.of() : cart.getItems().stream()
                        .map(CartItemResponse::fromEntity)
                        .toList(),
                totalPrice
        );
    }
}
