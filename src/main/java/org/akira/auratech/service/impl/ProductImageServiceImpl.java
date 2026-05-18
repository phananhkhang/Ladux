package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.ProductImage;
import org.akira.auratech.repository.ProductImageRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductImageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository repo;
    private final ProductRepository productRepo;

    @Override
    public List<ProductImageResponse> getProductImagesByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public List<ProductImageResponse> addImages(int productId, ProductImageRequest request) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi id = " + productId));

        List<ProductImage> productImages = request.imageUrl().stream()
                .map(imageUrl -> ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .isPrimary(false)
                        .build())
                .toList();

        return repo.saveAll(productImages).stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void deleteProductImageById(int productId, int imageId) {
        ProductImage image = repo.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product image voi id = " + imageId));
        if (image.getProduct() == null || !image.getProduct().getId().equals(productId)) {
            throw new BusinessRuleException("Anh khong thuoc san pham dang thao tac");
        }
        repo.delete(image);
    }
}
