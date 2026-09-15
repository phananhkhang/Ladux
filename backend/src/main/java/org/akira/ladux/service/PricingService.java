package org.akira.ladux.service;

import java.math.BigDecimal;

import org.akira.ladux.catalog.domain.model.Product;
import org.akira.ladux.catalog.domain.model.ProductVariant;

public interface PricingService {
    BigDecimal sellingPrice(ProductVariant productVariant);
}

