package org.akira.auratech.service;

import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getAllProductImages();

    ProductImageResponse getProductImageById(int id);

    List<ProductImageResponse> getProductImagesByProductId(int productId);

    List<ProductImageResponse> getPrimaryProductImagesByProductId(int productId);

    ProductImageResponse createProductImage(ProductImageRequest request);

    ProductImageResponse updateProductImage(int id, ProductImageRequest request);

    void deleteProductImageById(int id);
}
