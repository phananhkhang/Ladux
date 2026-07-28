package org.akira.ladux.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;

import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.service.impl.PricingServiceImpl;
import org.junit.jupiter.api.Test;

/**
 * Unit test cho PricingService: gia ban = discountPrice neu co, nguoc lai = basePrice.
 */
class PricingServiceImplTest {

    private final PricingServiceImpl pricingService = new PricingServiceImpl();

    @Test
    void usesDiscountPrice_whenPresent() {
        ProductVariant product = ProductVariant.builder()
                .price(new BigDecimal("100.00"))
                .discountPrice(new BigDecimal("80.00"))
                .build();
        assertEquals(0, new BigDecimal("80.00").compareTo(pricingService.sellingPrice(product)));
    }

    @Test
    void usesBasePrice_whenNoDiscount() {
        ProductVariant product = ProductVariant.builder()
                .price(new BigDecimal("100.00"))
                .discountPrice(null)
                .build();
        assertEquals(0, new BigDecimal("100.00").compareTo(pricingService.sellingPrice(product)));
    }
}
