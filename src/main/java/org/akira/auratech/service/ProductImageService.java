package org.akira.auratech.service;

import org.akira.auratech.model.ProductImage;

import java.util.List;

public interface ProductImageService {
    List<ProductImage> getAllProductImages();

    ProductImage getProductImageById(int id);

    List<ProductImage> getProductImagesByProductId(int productId);

    List<ProductImage> getPrimaryImagesByProductId(int productId);

    ProductImage createProductImage(ProductImage image);

    ProductImage updateProductImage(ProductImage image);

    void deleteProductImageById(int id);
}
