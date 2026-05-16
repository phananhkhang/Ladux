package org.akira.auratech.service;

import org.akira.auratech.model.Product;

import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();

    Product getProductById(int id);

    Product getProductBySlug(String slug);

    Product getProductBySku(String sku);

    List<Product> getProductsByBrandId(int brandId);

    List<Product> getProductsByCategoryId(int categoryId);

    List<Product> getActiveProducts();

    Product createProduct(Product product);

    Product updateProduct(Product product);

    void deleteProductById(int id);
}
