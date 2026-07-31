package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.admin.ProductRequest;
import org.akira.ladux.dto.request.admin.ProductVariantRequest;
import org.akira.ladux.dto.response.common.ProductResponse;
import org.akira.ladux.dto.response.common.ProductVariantResponse;
import org.akira.ladux.model.*;
import org.akira.ladux.repository.*;
import org.akira.ladux.service.ProductService;
import org.akira.ladux.utils.SlugUtils;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    private final ProductVariantRepository productVariantRepository;
    private final ColorRepository colorRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'id:' + #id")
    public ProductResponse getProductById(int id) {
        return ProductResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'slug:' + #slug")
    public ProductResponse getProductBySlug(String slug) {
        Product p = repo.findBySlug(slug);
        if (p == null) {
            throw new ResourceNotFoundException("Khong tim thay product voi slug = " + slug);
        }
        return ProductResponse.fromEntity(p);
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'brand:' + #brandId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ProductResponse> getProductsByBrandId(int brandId, Pageable pageable) {
        return repo.findByBrandId(brandId, pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'category:' + #categoryId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ProductResponse> getProductsByCategoryId(int categoryId, Pageable pageable) {
        return repo.findByCategoryId(categoryId, pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'active:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'search:' + #search + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return getAllProducts(pageable);
        }
        return repo.search(search.trim(), pageable)
                .map(ProductResponse::summaryFromEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay brand voi id = " + request.brandId()));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.categoryId()));
        Product product = Product.builder()
                .description(request.description())
                .brand(brand)
                .category(category)
                .name(request.name())
                .cpu(request.cpu())
                .gpu(request.gpu())
                .display(request.display())
                .battery(request.battery())
                .weight(request.weight())
                .numberOfFans(request.numberOfFans())
                .os(request.os())
                .isActive(request.isActive() == null ? true : request.isActive())
                .slug(SlugUtils.toSlug(request.name()))
                .build();
        if (request.variants() != null && !request.variants().isEmpty()) {
            for (ProductVariantRequest variantRequest : request.variants()) {
                Color color = colorRepository.findById(variantRequest.getColorId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy màu sắc với id = " + variantRequest.getColorId()));
                String rawSku = product.getName() + " " + variantRequest.getRam() + " " + variantRequest.getRom() + " " + color.getName();
                String sku = resolveSku(null, rawSku);
                ProductVariant variant = ProductVariant.builder()
                        .color(color)
                        .ram(variantRequest.getRam())
                        .rom(variantRequest.getRom())
                        .price(variantRequest.getPrice())
                        .discountPrice(variantRequest.getDiscountPrice())
                        .stockQuantity(variantRequest.getStockQuantity())
                        .sku(sku)
                        .isActive(variantRequest.isActive())
                        .build();
                product.addVariant(variant);
            }
        }
        replaceProductImages(product, request.imageUrls());
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(int id, ProductRequest request) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id));
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
        if (request.name() != null) {
            product.setName(request.name());
            product.setSlug(SlugUtils.toSlug(request.name()));
        }
        if (request.isActive() != null) {
            product.setActive(request.isActive());
        }
        if (request.imageUrls() != null) {
            replaceProductImages(product, request.imageUrls());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.cpu() != null) {
            product.setCpu(request.cpu());
        }
        if (request.gpu() != null) {
            product.setGpu(request.gpu());
        }
        if (request.display() != null) {
            product.setDisplay(request.display());
        }
        if (request.battery() != null) {
            product.setBattery(request.battery());
        }
        if (request.weight() != null) {
            product.setWeight(request.weight());
        }
        if (request.numberOfFans() != null) {
            product.setNumberOfFans(request.numberOfFans());
        }
        if (request.os() != null) {
            product.setOs(request.os());
        }
        if (request.imageUrls() != null) {
            replaceProductImages(product, request.imageUrls());
        }
        return ProductResponse.fromEntity(repo.save(product));
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }

    private String resolveSku(String requestedSku, String fallbackName) {
        String base;
        if (requestedSku != null && !requestedSku.isBlank()) {
            base = SlugUtils.toSlug(requestedSku);
            if (base.isBlank()) {
                base = SlugUtils.toSlug(fallbackName);
            }
        } else {
            base = SlugUtils.toSlug(fallbackName);
        }

        if (base.isBlank()) {
            base = "LAPTOP";
        }

        // Đổi toàn bộ SKU thành CHỮ HOA cho chuẩn thương mại điện tử
        return ensureUniqueSku(base.toUpperCase());
    }

    /** SKU column is varchar(50) — keep base short enough for numeric suffixes. */
    private String ensureUniqueSku(String rawBase) {
        String base = rawBase.length() > 40 ? rawBase.substring(0, 40).replaceAll("-+$", "") : rawBase;
        if (base.isBlank()) {
            base = "LAPTOP";
        }

        String candidate = base.length() > 50 ? base.substring(0, 50) : base;
        int suffix = 2;

        // SỬA CHỖ NÀY: Dùng productVariantRepository thay vì repo (Product)
        while (productVariantRepository.existsBySku(candidate)) {
            String withSuffix = base + "-" + suffix++;
            candidate = withSuffix.length() > 50 ? withSuffix.substring(0, 50) : withSuffix;
        }

        return candidate;
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
    // == Variant Products ==
    public ProductVariantResponse getProductVariantById(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product variant voi id = " + variantId));
        return ProductVariantResponse.fromEntity(variant);
    }
}
