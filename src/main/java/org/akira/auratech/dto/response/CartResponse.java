package org.akira.auratech.dto.response;

import org.akira.auratech.model.Cart;
import java.util.List;

public record CartResponse(
        Integer id,
        Integer userId,
        List<Integer> itemIds
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
                itemIds
        );
    }
}
