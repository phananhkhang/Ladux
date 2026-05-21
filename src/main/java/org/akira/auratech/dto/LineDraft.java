package org.akira.auratech.dto;

import org.akira.auratech.model.Product;
import java.math.BigDecimal;

public record LineDraft(
        Product product,
        Integer quantity,
        BigDecimal priceAtPurchase,
        BigDecimal lineTotal
) {}