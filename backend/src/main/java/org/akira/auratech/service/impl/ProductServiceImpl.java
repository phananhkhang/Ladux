package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductRequest;
import org.akira.auratech.dto.response.ProductResponse;
import org.akira.auratech.model.Brand;
import org.akira.auratech.model.Category;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.ProductImage;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.ProductService;
import org.akira.auratech.utils.SlugUtils;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository repo;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(int id) {
        return ProductResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        return ProductResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        return ProductResponse.fromEntity(repo.findBySku(sku));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByBrandId(int brandId, Pageable pageable) {
        return repo.findByBrandId(brandId, pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategoryId(int categoryId, Pageable pageable) {
        return repo.findByCategoryId(categoryId, pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        return repo.search(search, pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay brand voi id = " + request.brandId()));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.categoryId()));
        if (brand == null || category == null) {
            return null;
        }
        validateProductPricing(request.basePrice(), request.discountPrice());
        Product product = Product.builder()
                .brand(brand)
                .category(category)
                .sku(request.sku())
                .name(request.name())
                .basePrice(request.basePrice())
                .discountPrice(request.discountPrice())
                .stockQuantity(request.stockQuantity() == null ? 0 : request.stockQuantity())
                .specs(request.specs())
                .thumbnail(request.thumbnail())
                .isActive(request.isActive() == null ? true : request.isActive())
                .slug(SlugUtils.toSlug(request.name()))
                .build();
        replaceProductImages(product, request.imageUrls());
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    @Transactional
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
        if (request.imageUrls() != null) {
            replaceProductImages(product, request.imageUrls());
        }
        return ProductResponse.fromEntity(product);
    }

    @Override
    @Transactional
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }

    private void validateProductPricing(BigDecimal basePrice, BigDecimal discountPrice) {
        if (discountPrice != null && discountPrice.compareTo(basePrice) > 0) {
            throw new BusinessRuleException("DiscountPrice khong duoc lon hon BasePrice");
        }
    }

    private void replaceProductImages(Product product, java.util.List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }
        product.getImages().clear();
        imageUrls.forEach(imageUrl -> product.getImages().add(ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .build()));
    }
}
