package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Product;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductService;
import org.akira.auratech.utils.SlugUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository repo;

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @Override
    public Product getProductById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Product getProductBySlug(String slug) {
        return repo.findBySlug(slug);
    }

    @Override
    public Product getProductBySku(String sku) {
        return repo.findBySku(sku);
    }

    @Override
    public List<Product> getProductsByBrandId(int brandId) {
        return repo.findByBrandId(brandId);
    }

    @Override
    public List<Product> getProductsByCategoryId(int categoryId) {
        return repo.findByCategoryId(categoryId);
    }

    @Override
    public List<Product> getActiveProducts() {
        return repo.findByIsActiveTrue();
    }

    @Override
    public Product createProduct(Product product) {
        if (product.getName() != null && (product.getSlug() == null || product.getSlug().isBlank())) {
            product.setSlug(SlugUtils.toSlug(product.getName()));
        }
        return repo.save(product);
    }

    @Override
    public Product updateProduct(Product product) {
        if (product.getName() != null && (product.getSlug() == null || product.getSlug().isBlank())) {
            product.setSlug(SlugUtils.toSlug(product.getName()));
        }
        return repo.save(product);
    }

    @Override
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }
}

