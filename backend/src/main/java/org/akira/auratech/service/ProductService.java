package org.akira.auratech.service;

import org.akira.auratech.dto.request.ProductRequest;
import org.akira.auratech.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> getAllProducts(Pageable pageable);

    ProductResponse getProductById(int id);

    ProductResponse getProductBySlug(String slug);

    ProductResponse getProductBySku(String sku);

    Page<ProductResponse> getProductsByBrandId(int brandId, Pageable pageable);

    Page<ProductResponse> getProductsByCategoryId(int categoryId, Pageable pageable);

    Page<ProductResponse> getActiveProducts(Pageable pageable);

    Page<ProductResponse> searchProducts(String search, Pageable pageable);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(int id, ProductRequest request);

    void deleteProductById(int id);
}
