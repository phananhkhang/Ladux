package org.akira.auratech.service.impl;

import org.akira.auratech.model.Product;
import org.akira.auratech.service.PricingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PricingServiceImpl implements PricingService {
    @Override
    public BigDecimal sellingPrice(Product product) {
        return product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getBasePrice();
    }
}

