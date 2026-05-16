package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {
    @NotBlank(message = "Ten khong duoc de trong")
    @Size(min = 1, max = 100, message = "Ten category phai tu 1 den 100 ky tu")
    private String name;

    private String slug;

    private Integer parentId;
}

