package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderHistoryRequest {
    @NotNull(message = "OrderId khong duoc de trong")
    private Integer orderId;

    @NotBlank(message = "Status khong duoc de trong")
    private String status;

    private String description;
}

