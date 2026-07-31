package org.akira.ladux.dto.order.response;

import org.akira.ladux.model.Cart;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Integer id,
        Integer userId,
        List<CartItemResponse> items,
        BigDecimal totalPrice
) implements Serializable {
    public static CartResponse fromEntity(Cart cart) {
        if (cart == null) {
            return null;
        }
        BigDecimal totalPrice = cart.getItems() == null ? BigDecimal.ZERO : cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProductVariant().getDiscountPrice() == null
                            ? item.getProductVariant().getPrice()
                            : item.getProductVariant().getDiscountPrice();
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
