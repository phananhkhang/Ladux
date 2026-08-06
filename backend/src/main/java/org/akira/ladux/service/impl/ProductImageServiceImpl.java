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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

        Set<String> existingUrls = repo.findByProductId(productId).stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toSet());
        Set<String> uniqueUrls = imageUrls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(imageUrl -> !imageUrl.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new)); // dùng linkedHashSet để giữ nguyên thứ tự và loại bỏ trùng lặp

        boolean currentEmpty = existingUrls.isEmpty();
        List<String> newUrls = uniqueUrls.stream()
                .filter(imageUrl -> !existingUrls.contains(imageUrl))
                .toList();

        List<ProductImage> productImages = new ArrayList<>();
        for (int i = 0; i < newUrls.size(); i++) {
            productImages.add(ProductImage.builder()
                    .product(product)
                    .imageUrl(newUrls.get(i))
                    .isPrimary(currentEmpty && i == 0)
                    .build());
        }
        if (productImages.isEmpty()) {
            return List.of(); // Trả về list rỗng nhưng ko có saveAll nên yên tâm không mất dữ liệu ảnh đâu!
        }

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
