package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.LineDraft;
import org.akira.auratech.dto.request.OrderLineRequest;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Product;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.InventoryService;
import org.akira.auratech.service.PricingService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.akira.auratech.exception.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final ProductRepository productRepository;
    private final PricingService pricingService;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    @CacheEvict(value = "products", allEntries = true)
    public List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items) {
        List<LineDraft> drafts = new ArrayList<>();

        for (OrderLineRequest item : items) {
            // 1. Trừ kho atomic (không cần lock lâu)
            int updated = productRepository.deductStockAtomically(item.productId(), item.quantity());
            if (updated == 0) {
                throw new InsufficientStockException("Không đủ hàng hoặc sản phẩm không tồn tại");
            }

            // 2. Load product để lấy giá + thông tin (sau khi đã trừ thành công)
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            BigDecimal price = pricingService.sellingPrice(product);
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.quantity()));

            drafts.add(new LineDraft(product, item.quantity(), price, lineTotal));
        }
        return drafts;
    }
}