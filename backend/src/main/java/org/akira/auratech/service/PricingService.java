package org.akira.auratech.service;

import org.akira.auratech.model.Product;

import java.math.BigDecimal;

public interface PricingService {
    BigDecimal sellingPrice(Product product);
}

