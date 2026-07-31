package org.akira.ladux.dto.internal;

import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;

import java.math.BigDecimal;

// Dong dat hang tam sau khi tru kho va chot gia — dung noi bo trong createOrder.
// product: da tru stock; priceAtPurchase: gia snapshot; lineTotal = priceAtPurchase * quantity.
public record LineDraft(
        ProductVariant productVariant,
        Integer quantity,
        BigDecimal priceAtPurchase,
        BigDecimal lineTotal
) {}