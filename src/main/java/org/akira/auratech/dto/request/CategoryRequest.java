package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Ten khong duoc de trong")
        @Size(min = 1, max = 100, message = "Ten category phai tu 1 den 100 ky tu")
        String name,
        String slug,
        Integer parentId
) {}
