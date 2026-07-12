package org.akira.ladux.service;

import org.akira.ladux.model.Product;

import java.math.BigDecimal;

public interface PricingService {
    BigDecimal sellingPrice(Product product);
}

