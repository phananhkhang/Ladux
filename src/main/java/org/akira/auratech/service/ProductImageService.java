package org.akira.auratech.service;

import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getProductImagesByProductId(int productId);

    List<ProductImageResponse> addImages(int productId, ProductImageRequest request);

    void deleteProductImageById(int productId, int imageId);
}
