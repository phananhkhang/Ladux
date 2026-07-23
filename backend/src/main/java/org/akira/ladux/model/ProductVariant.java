package org.akira.ladux.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(nullable = false, unique = true, length = 50)
    private String sku; // Mã SKU riêng cho phiên bản (VD: IP15PM-256GB-BLK)

    @Column(length = 50)
    private String color; // VD: Titanium Đen

    @Column(length = 50)
    private String storage; // VD: 256GB

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price; // Giá gốc biến thể

    @Column(precision = 15, scale = 2)
    private BigDecimal discountPrice; // Giá khuyến mãi (nếu có)

    @Column(nullable = false)
    @Builder.Default
    private int stockQuantity = 0; // Tồn kho riêng của bản này

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "productVariant")
    @ToString.Exclude
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "productVariant")
    @ToString.Exclude
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
}
