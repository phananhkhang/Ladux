package org.akira.auratech.dto;

import org.akira.auratech.model.Product;
import java.math.BigDecimal;

public record LineDraft( // 1 dòng sản phẩm trong giỏ hàng
        Product product,
        Integer quantity,
        BigDecimal priceAtPurchase,
        BigDecimal lineTotal
) {}