package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.response.ProductImageResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductImage;
import org.akira.ladux.repository.ProductImageRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.service.FileStorageService;
import org.akira.ladux.service.ProductImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository repo;
    private final ProductRepository productRepo;
    private final FileStorageService fileStorage;

    @Value("${app.upload.product-dir:products}")
    private String productUploadDir;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "productImages", key = "'product:' + #productId")
    public List<ProductImageResponse> getProductImagesByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(ProductImageResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productImages", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public List<ProductImageResponse> addImages(int productId, List<String> imageUrls) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi id = " + productId));

        List<ProductImage> productImages = imageUrls.stream()
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
    @Caching(evict = {
            @CacheEvict(value = "productImages", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public List<ProductImageResponse> uploadImage(int productId, List<MultipartFile> files) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi id = " + productId));
        List<ProductImageResponse> responses = new ArrayList<>();
        boolean thumbnailAssigned = false;
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            String url = fileStorage.store(productUploadDir, file);
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .build();
            responses.add(ProductImageResponse.fromEntity(repo.save(image)));
            if (!thumbnailAssigned && (product.getImages().get(0) == null || product.getImages().get(0).getImageUrl().isBlank())) {
                product.setImages(List.of(image));
                productRepo.save(product);
                thumbnailAssigned = true;
            }
        }
        return responses;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productImages", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public void deleteProductImageById(int productId, int imageId) {
        ProductImage image = repo.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product image voi id = " + imageId));
        if (image.getProduct() == null || !image.getProduct().getId().equals(productId)) {
            throw new BusinessRuleException("Anh khong thuoc san pham dang thao tac");
        }
        String imageUrl = image.getImageUrl();
        repo.delete(image);
        fileStorage.deleteIfLocal(imageUrl);
    }
}
