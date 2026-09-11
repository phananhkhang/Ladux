package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.response.ProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> uploadImage(int productId, List<MultipartFile> files, List<String> imageUrls);

    void deleteProductImageById(int productId, int imageId);
}
