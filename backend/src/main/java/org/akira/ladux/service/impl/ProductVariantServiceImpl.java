package org.akira.ladux.service.impl;

import org.akira.ladux.dto.request.ProductVariantRequest;
import org.akira.ladux.dto.response.ProductVariantResponse;
import org.akira.ladux.model.Color;
import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.repository.ProductVariantRepository;
import org.akira.ladux.service.ProductVariantService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ProductVariantServiceImpl implements ProductVariantService {
    private final ProductVariantService productVariantService;
    private final ProductVariantRepository productVariantRepository;

    public ProductVariantServiceImpl(ProductVariantService productVariantService, ProductVariantRepository productVariantRepository) {
        this.productVariantService = productVariantService;
        this.productVariantRepository = productVariantRepository;
    }

    @Override
    public ProductVariantResponse addProductVariant(Integer productId, String sku, Color color, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active) {
        if (productId == null || sku == null || color == null || ram == null || rom == null || price == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Không được để trống bất kì trường nào và StockQuantity không được âm");
        }
        if (color.getId() == null) {
            throw new IllegalArgumentException("Màu sắc không hợp lệ");
        }
        ProductVariantResponse response = new ProductVariantResponse(
                productId,
                sku,
                color,
                ram,
                rom,
                price,
                discountPrice,
                stockQuantity,
                active
        );
        return response;
    }
    public ProductVariantResponse updateProductVariant(Integer id, Color color, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active) {
        if (id == null || color == null || ram == null || rom == null || price == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Không được để trống bất kì trường nào và StockQuantity không được âm");
        }
        ProductVariant existingVariant = productVariantRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ProductVariant với id: " + id));
        if (color.getId() != null) {
            existingVariant.setColor(color);
        }
        if (ram != null) {
            existingVariant.setRam(ram);
        }
        if (rom != null) {
            existingVariant.setRom(rom);
        }
        if (price != null) {
            existingVariant.setPrice(price);
        }
        if (discountPrice != null) {
            existingVariant.setDiscountPrice(discountPrice);
        }
        if (stockQuantity >= 0) {
            existingVariant.setStockQuantity(stockQuantity);
        }
        existingVariant.setActive(active);
        productVariantRepository.save(existingVariant);
        return new ProductVariantResponse(
                existingVariant.getId(),
                existingVariant.getProduct().getId(),
                existingVariant.getSku(),
                existingVariant.getColor(),
                existingVariant.getRam(),
                existingVariant.getRom(),
                existingVariant.getPrice(),
                existingVariant.getDiscountPrice(),
                existingVariant.getStockQuantity(),
                existingVariant.isActive()
        );
    }
}
