package org.akira.auratech.service;

import org.akira.auratech.dto.response.ProductImageResponse;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getProductImagesByProductId(int productId);

    List<ProductImageResponse> addImages(int productId, List<String> imageUrls);

    void deleteProductImageById(int productId, int imageId);
}
