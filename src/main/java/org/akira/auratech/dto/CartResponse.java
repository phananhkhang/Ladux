package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Cart;

import java.util.List;

@Getter
@Setter
@Builder
public class CartResponse {
    private Integer id;
    private Integer userId;
    private List<Integer> itemIds;

    public static CartResponse fromEntity(Cart cart) {
        if (cart == null) {
            return null;
        }
        List<Integer> itemIds = cart.getItems() == null ? List.of() : cart.getItems().stream()
                .map(item -> item.getId())
                .toList();
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() == null ? null : cart.getUser().getId())
                .itemIds(itemIds)
                .build();
    }
}

