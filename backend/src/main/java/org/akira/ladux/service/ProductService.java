package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.ProductRequest;
import org.akira.ladux.dto.catalog.response.ProductResponse;
import org.akira.ladux.dto.catalog.response.ProductVariantResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    PageResponse<ProductResponse> getAllProducts(Pageable pageable);

    ProductResponse getProductById(int id);

    ProductResponse getProductBySlug(String slug);

    PageResponse<ProductResponse> getProductsByBrandId(int brandId, Pageable pageable);

    PageResponse<ProductResponse> getProductsByCategoryId(int categoryId, Pageable pageable);

    PageResponse<ProductResponse> searchProducts(String search, Pageable pageable);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(int id, ProductRequest request);

    void deleteProductById(int id);

    ProductVariantResponse getProductVariantById(Integer variantId);
}
