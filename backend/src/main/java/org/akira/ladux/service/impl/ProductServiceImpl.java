package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.request.ProductRequest;
import org.akira.ladux.dto.catalog.request.ProductVariantRequest;
import org.akira.ladux.dto.catalog.response.ProductResponse;
import org.akira.ladux.dto.catalog.response.ProductVariantResponse;
import org.akira.ladux.model.*;
import org.akira.ladux.repository.*;
import org.akira.ladux.service.ProductService;
import org.akira.ladux.utils.SlugUtils;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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
    @Cacheable(value = "products", key = "'v4:all:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return toSummaryPage(repo.findAllIds(pageable), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v3:id:' + #id")
    public ProductResponse getProductById(int id) {
        return ProductResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v3:slug:' + #slug")
    public ProductResponse getProductBySlug(String slug) {
        Product p = repo.findBySlug(slug);
        if (p == null) {
            throw new ResourceNotFoundException("Khong tim thay product voi slug = " + slug);
        }
        return ProductResponse.fromEntity(p);
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v4:brand:' + #brandId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> getProductsByBrandId(int brandId, Pageable pageable) {
        return toSummaryPage(repo.findIdsByBrandId(brandId, pageable), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v4:category:' + #categoryId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> getProductsByCategoryId(int categoryId, Pageable pageable) {
        return toSummaryPage(repo.findIdsByCategoryId(categoryId, pageable), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v4:active:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        return toSummaryPage(repo.findIdsByIsActiveTrue(pageable), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'v4:search:' + #search + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return getAllProducts(pageable);
        }
        return toSummaryPage(repo.searchIds(search.trim(), pageable), pageable);
    }

    private Page<ProductResponse> toSummaryPage(Page<Integer> idPage, Pageable pageable) {
        if (idPage.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, idPage.getTotalElements());
        }
        Map<Integer, Product> productsById = repo.findSummariesByIdIn(idPage.getContent()).stream()
                .collect(java.util.stream.Collectors.toMap(Product::getId, product -> product));
        List<ProductResponse> content = idPage.getContent().stream()
                .map(productsById::get)
                .filter(java.util.Objects::nonNull)
                .map(ProductResponse::summaryFromEntity)
                .toList();
        return new PageImpl<>(content, pageable, idPage.getTotalElements());
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
                Color color = colorRepository.findById(variantRequest.colorId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy màu sắc với id = " + variantRequest.colorId()));
                String rawSku = product.getName() + " " + variantRequest.ram() + " " + variantRequest.rom() + " " + color.getName();
                String sku = resolveSku(null, rawSku);
                ProductVariant variant = ProductVariant.builder()
                        .color(color)
                        .ram(variantRequest.ram())
                        .rom(variantRequest.rom())
                        .price(variantRequest.price())
                        .discountPrice(variantRequest.discountPrice())
                        .stockQuantity(variantRequest.stockQuantity())
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
        if (request.variants() != null && !request.variants().isEmpty()) {
            upsertProductVariants(product, request.variants());
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

    private void replaceProductImages(Product product, List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }
        product.getImages().clear();
        imageUrls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(imageUrl -> !imageUrl.isBlank())
                .distinct() // Loại bỏ trùng lặp
                .forEach(imageUrl -> product.getImages().add(ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .build()));
    }

    private void upsertProductVariants(Product product, List<ProductVariantRequest> variantRequests) {
        Map<Integer, ProductVariant> existingById = product.getVariants().stream()
                .filter(variant -> variant.getId() != null)
                .collect(Collectors.toMap(ProductVariant::getId, variant -> variant));

        for (ProductVariantRequest request : variantRequests) {
            ProductVariant variant = request.id() == null ? null : existingById.get(request.id());
            if (request.id() != null && variant == null) {
                throw new BusinessRuleException("VariantId khong thuoc san pham dang cap nhat: " + request.id());
            }
            if (variant == null) {
                variant = ProductVariant.builder()
                        .sku(resolveSku(null, buildVariantSkuSeed(product.getName(), request)))
                        .build();
                product.addVariant(variant);
            }
            applyVariantFields(variant, request);
        }
    }

    private void applyVariantFields(ProductVariant variant, ProductVariantRequest request) {
        variant.setColor(resolveColor(request.colorId()));
        variant.setRam(request.ram());
        variant.setRom(request.rom());
        variant.setPrice(requirePrice(request.price()));
        variant.setDiscountPrice(request.discountPrice());
        validateProductPricing(variant.getPrice(), variant.getDiscountPrice());
        variant.setStockQuantity(request.stockQuantity());
        variant.setActive(request.isActive());
    }

    private Color resolveColor(Integer colorId) {
        if (colorId == null) {
            throw new BusinessRuleException("ColorId khong duoc de trong");
        }
        return colorRepository.findById(colorId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mau sac voi id = " + colorId));
    }

    private BigDecimal requirePrice(BigDecimal price) {
        if (price == null) {
            throw new BusinessRuleException("Price khong duoc de trong");
        }
        return price;
    }

    private String buildVariantSkuSeed(String productName, ProductVariantRequest request) {
        Color color = resolveColor(request.colorId());
        return productName + " " + request.ram() + " " + request.rom() + " " + color.getName();
    }
    // == Variant Products ==
    public ProductVariantResponse getProductVariantById(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product variant voi id = " + variantId));
        return ProductVariantResponse.fromEntity(variant);
    }
}
