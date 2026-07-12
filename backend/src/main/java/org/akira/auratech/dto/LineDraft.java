package org.akira.auratech.dto;

import org.akira.auratech.model.Product;
import java.math.BigDecimal;

// Dong dat hang tam sau khi tru kho va chot gia — dung noi bo trong createOrder.
// product: da tru stock; priceAtPurchase: gia snapshot; lineTotal = priceAtPurchase * quantity.
public record LineDraft(
        Product product,
        Integer quantity,
        BigDecimal priceAtPurchase,
        BigDecimal lineTotal
) {}