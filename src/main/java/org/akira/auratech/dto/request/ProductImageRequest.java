package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProductImageRequest(

        @NotEmpty(message = "Danh sách không được để trống")
        List<
                @NotBlank(message = "Đường dẫn hình ảnh không được để trống")
                @Size(max = 255, message = "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
                String
                > imageUrl
) {}
