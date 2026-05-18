package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductRequest;
import org.akira.auratech.dto.response.ProductResponse;
import org.akira.auratech.model.Brand;
import org.akira.auratech.model.Category;
import org.akira.auratech.model.Product;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductService;
import org.akira.auratech.utils.SlugUtils;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
        return ProductResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id)));
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
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay brand voi id = " + request.brandId()));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.categoryId()));
        if (brand == null || category == null) {
            return null;
        }
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.toSlug(request.name());
        }
        validateProductPricing(request.basePrice(), request.discountPrice());
        Product product = Product.builder()
                .brand(brand)
                .category(category)
                .sku(request.sku())
                .name(request.name())
                .slug(slug)
                .basePrice(request.basePrice())
                .discountPrice(request.discountPrice())
                .stockQuantity(request.stockQuantity() == null ? 0 : request.stockQuantity())
                .specs(request.specs())
                .thumbnail(request.thumbnail())
                .isActive(request.isActive() == null ? true : request.isActive())
                .build();
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    public ProductResponse updateProduct(int id, ProductRequest request) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id));
        BigDecimal nextBasePrice = request.basePrice() == null ? product.getBasePrice() : request.basePrice();
        BigDecimal nextDiscountPrice = request.discountPrice() == null ? product.getDiscountPrice() : request.discountPrice();
        validateProductPricing(nextBasePrice, nextDiscountPrice);
        if (request.brandId() != null) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay brand voi id = " + request.brandId()));
            product.setBrand(brand);
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.categoryId()));
            product.setCategory(category);
        }
        if (request.sku() != null) {
            product.setSku(request.sku());
        }
        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.slug() != null && !request.slug().isBlank()) {
            product.setSlug(request.slug());
        } else if (request.name() != null) {
            product.setSlug(SlugUtils.toSlug(request.name()));
        }
        if (request.basePrice() != null) {
            product.setBasePrice(request.basePrice());
        }
        if (request.discountPrice() != null) {
            product.setDiscountPrice(request.discountPrice());
        }
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.specs() != null) {
            product.setSpecs(request.specs());
        }
        if (request.thumbnail() != null) {
            product.setThumbnail(request.thumbnail());
        }
        if (request.isActive() != null) {
            product.setActive(request.isActive());
        }
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }

    private void validateProductPricing(BigDecimal basePrice, BigDecimal discountPrice) {
        if (discountPrice != null && discountPrice.compareTo(basePrice) > 0) {
            throw new BusinessRuleException("DiscountPrice khong duoc lon hon BasePrice");
        }
    }
}
