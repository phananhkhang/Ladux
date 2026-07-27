package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.ProductVariantResponse;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Color;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.repository.ColorRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.repository.ProductVariantRepository;
import org.akira.ladux.service.ProductVariantService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ColorRepository colorRepository;

    @Override
    public ProductVariantResponse addProductVariant(Integer productId, Integer colorId, String ram, String rom, BigDecimal price, BigDecimal discountPrice, int stockQuantity, boolean active) {
        if (productId == null || colorId == null || ram == null || rom == null || price == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Không được để trống bất kì trường nào và StockQuantity không được âm");
        }
        if (colorId == null) {
            throw new IllegalArgumentException("Màu sắc không hợp lệ");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));
        Color color = colorRepository.findById(colorId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy màu sắc với id: " + colorId));
        ProductVariant productVariant = ProductVariant.builder()
                .product(product)
                .sku(generateSku(product, color, ram, rom))
                .color(color)
                .ram(ram)
                .rom(rom)
                .price(price)
                .discountPrice(discountPrice)
                .stockQuantity(stockQuantity)
                .isActive(active)
                .build();
        return ProductVariantResponse.fromEntity(productVariantRepository.save(productVariant));
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
