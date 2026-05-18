package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.ProductImage;
import org.akira.auratech.repository.ProductImageRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductImageService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository repo;
    private final ProductRepository productRepository;

    @Override
    public List<ProductImageResponse> getAllProductImages() {
        return repo.findAll().stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    public ProductImageResponse getProductImageById(int id) {
        return ProductImageResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product image voi id = " + id)));
    }

    @Override
    public List<ProductImageResponse> getProductImagesByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    public List<ProductImageResponse> getPrimaryProductImagesByProductId(int productId) {
        return repo.findByProductIdAndIsPrimaryTrue(productId).stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    public ProductImageResponse createProductImage(ProductImageRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
        if (product == null) {
            return null;
        }
        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(request.imageUrl())
                .isPrimary(request.isPrimary() == null ? false : request.isPrimary())
                .build();
        return ProductImageResponse.fromEntity(repo.save(image));
    }

    @Override
    public ProductImageResponse updateProductImage(int id, ProductImageRequest request) {
        ProductImage image = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product image voi id = " + id));
        if (request.productId() != null) {
            Product product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
            image.setProduct(product);
        }
        if (request.imageUrl() != null) {
            image.setImageUrl(request.imageUrl());
        }
        if (request.isPrimary() != null) {
            image.setPrimary(request.isPrimary());
        }
        return ProductImageResponse.fromEntity(repo.save(image));
    }

    @Override
    public void deleteProductImageById(int id) {
        repo.deleteById(id);
    }
}
