package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ProductRequest;
import org.akira.auratech.dto.ProductResponse;
import org.akira.auratech.model.Brand;
import org.akira.auratech.model.Category;
import org.akira.auratech.model.Product;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductService;
import org.akira.auratech.utils.SlugUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository repo;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> getAllProducts() {
        return repo.findAll().stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Override
    public ProductResponse getProductById(int id) {
        return ProductResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        return ProductResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        return ProductResponse.fromEntity(repo.findBySku(sku));
    }

    @Override
    public List<ProductResponse> getProductsByBrandId(int brandId) {
        return repo.findByBrandId(brandId).stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategoryId(int categoryId) {
        return repo.findByCategoryId(categoryId).stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Override
    public List<ProductResponse> getActiveProducts() {
        return repo.findByIsActiveTrue().stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId()).orElse(null);
        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        if (brand == null || category == null) {
            return null;
        }
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.toSlug(request.getName());
        }
        Product product = Product.builder()
                .brand(brand)
                .category(category)
                .sku(request.getSku())
                .name(request.getName())
                .slug(slug)
                .basePrice(request.getBasePrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity() == null ? 0 : request.getStockQuantity())
                .specs(request.getSpecs())
                .thumbnail(request.getThumbnail())
                .isActive(request.getIsActive() == null ? true : request.getIsActive())
                .build();
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    public ProductResponse updateProduct(int id, ProductRequest request) {
        Product product = repo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId()).orElse(null);
            if (brand == null) {
                return null;
            }
            product.setBrand(brand);
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            if (category == null) {
                return null;
            }
            product.setCategory(category);
        }
        if (request.getSku() != null) {
            product.setSku(request.getSku());
        }
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            product.setSlug(request.getSlug());
        } else if (request.getName() != null) {
            product.setSlug(SlugUtils.toSlug(request.getName()));
        }
        if (request.getBasePrice() != null) {
            product.setBasePrice(request.getBasePrice());
        }
        if (request.getDiscountPrice() != null) {
            product.setDiscountPrice(request.getDiscountPrice());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getSpecs() != null) {
            product.setSpecs(request.getSpecs());
        }
        if (request.getThumbnail() != null) {
            product.setThumbnail(request.getThumbnail());
        }
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }
}
