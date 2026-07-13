package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.ProductRequest;
import org.akira.ladux.dto.response.ProductResponse;
import org.akira.ladux.model.Brand;
import org.akira.ladux.model.Category;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductImage;
import org.akira.ladux.repository.BrandRepository;
import org.akira.ladux.repository.CategoryRepository;
import org.akira.ladux.repository.ProductRepository;
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
    @Cacheable(value = "products", key = "'sku:' + #sku")
    public ProductResponse getProductBySku(String sku) {
        Product p = repo.findBySku(sku);
        if (p == null) {
            throw new ResourceNotFoundException("Khong tim thay product voi sku = " + sku);
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
        validateProductPricing(request.basePrice(), request.discountPrice());
        Product product = Product.builder()
                .brand(brand)
                .category(category)
                .sku(resolveSku(request.sku(), request.name()))
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
    @CacheEvict(value = "products", allEntries = true)
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
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProductById(int id) {
        repo.deleteById(id);
    }

    private String resolveSku(String requestedSku, String productName) {
        // Always produce a non-blank unique SKU (never persist empty string)
        String base;
        if (requestedSku != null && !requestedSku.isBlank()) {
            base = SlugUtils.toSlug(requestedSku);
            if (base.isBlank()) {
                base = SlugUtils.toSlug(productName);
            }
        } else {
            base = SlugUtils.toSlug(productName);
        }
        if (base.isBlank()) {
            base = "product";
        }
        return ensureUniqueSku(base);
    }

    /** SKU column is varchar(50) — keep base short enough for numeric suffixes. */
    private String ensureUniqueSku(String rawBase) {
        String base = rawBase.length() > 40 ? rawBase.substring(0, 40).replaceAll("-+$", "") : rawBase;
        if (base.isBlank()) {
            base = "product";
        }
        String candidate = base.length() > 50 ? base.substring(0, 50) : base;
        int suffix = 2;
        while (repo.existsBySku(candidate)) {
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
}
