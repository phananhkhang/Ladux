package org.akira.ladux.service;

import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;

import java.math.BigDecimal;

public interface PricingService {
    BigDecimal sellingPrice(ProductVariant productVariant);
}

