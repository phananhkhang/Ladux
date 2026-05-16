package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    @NotNull(message = "UserId khong duoc de trong")
    private Integer userId;

    @NotNull(message = "ProductId khong duoc de trong")
    private Integer productId;

    private Integer rating;

    private String comment;
}

