package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.ProductImageResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductImage;
import org.akira.ladux.repository.ProductImageRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.service.ProductImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository repo;
    private final ProductRepository productRepo;

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    @Value("${app.upload.product-dir:products}")
    private String productUploadDir;

    private static final Map<String, String> ALLOWED_IMAGE_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

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
            String url = storeProductImage(file);
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .build();
            responses.add(ProductImageResponse.fromEntity(repo.save(image)));
            if (!thumbnailAssigned && (product.getThumbnail() == null || product.getThumbnail().isBlank())) {
                product.setThumbnail(url);
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
        repo.delete(image);
    }

    private String storeProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("File anh khong duoc de trong");
        }

            String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = ALLOWED_IMAGE_TYPES.get(contentType);
        if (extension == null) {
            throw new BusinessRuleException("Chi ho tro anh JPG, PNG, WEBP hoac GIF");
        }

        String filename = UUID.randomUUID() + extension;
        Path productDirectory = Path.of(uploadRoot, productUploadDir).toAbsolutePath().normalize();
        Path target = productDirectory.resolve(filename).normalize();
        if (!target.startsWith(productDirectory)) {
            throw new BusinessRuleException("Duong dan upload khong hop le");
        }

        try {
            Files.createDirectories(productDirectory);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessRuleException("Khong the luu file anh san pham");
        }

        return "/uploads/" + productUploadDir + "/" + filename;
    }
}
