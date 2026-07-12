package org.akira.ladux.service.impl;

import org.akira.ladux.model.Product;
import org.akira.ladux.service.PricingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

// Tinh gia ban tai thoi diem hien tai. Uu tien discountPrice, khong co thi dung basePrice.
// Gia chot vao OrderItem.priceAtPurchase — thay doi gia sau khong anh huong don cu.
@Service
public class PricingServiceImpl implements PricingService {
    @Override
    public BigDecimal sellingPrice(Product product) {
        return product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getBasePrice();
    }
}

