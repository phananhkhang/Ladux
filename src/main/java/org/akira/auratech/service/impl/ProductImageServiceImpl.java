package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.ProductImage;
import org.akira.auratech.repository.ProductImageRepository;
import org.akira.auratech.service.ProductImageService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository repo;

    @Override
    public List<ProductImage> getAllProductImages() {
        return repo.findAll();
    }

    @Override
    public ProductImage getProductImageById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<ProductImage> getProductImagesByProductId(int productId) {
        return repo.findByProductId(productId);
    }

    @Override
    public List<ProductImage> getPrimaryImagesByProductId(int productId) {
        return repo.findByProductIdAndIsPrimaryTrue(productId);
    }

    @Override
    public ProductImage createProductImage(ProductImage image) {
        return repo.save(image);
    }

    @Override
    public ProductImage updateProductImage(ProductImage image) {
        return repo.save(image);
    }

    @Override
    public void deleteProductImageById(int id) {
        repo.deleteById(id);
    }
}

