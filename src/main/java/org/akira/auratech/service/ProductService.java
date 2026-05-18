package org.akira.auratech.service;

import org.akira.auratech.dto.request.ProductRequest;
import org.akira.auratech.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(int id);

    ProductResponse getProductBySlug(String slug);

    ProductResponse getProductBySku(String sku);

    List<ProductResponse> getProductsByBrandId(int brandId);

    List<ProductResponse> getProductsByCategoryId(int categoryId);

    List<ProductResponse> getActiveProducts();

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(int id, ProductRequest request);

    void deleteProductById(int id);
}
