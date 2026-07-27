package org.akira.ladux.service.impl;

import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.service.PricingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

// Tinh gia ban tai thoi diem hien tai. Uu tien discountPrice, khong co thi dung Price
// Gia chot vao OrderItem.priceAtPurchase — thay doi gia sau khong anh huong don cu.
// DiscountPrice la gia sau khuyen mai, Price la gia goc. Neu discountPrice = null thi dung Price.
@Service
public class PricingServiceImpl implements PricingService {
    @Override
    public BigDecimal sellingPrice(ProductVariant productVariant) {
        return productVariant.getDiscountPrice() != null ? productVariant.getDiscountPrice() : productVariant.getPrice();
    }
}

