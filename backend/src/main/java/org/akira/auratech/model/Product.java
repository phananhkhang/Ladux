package org.akira.auratech.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    @ToString.Exclude
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    private Category category;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal discountPrice;

    @Column(nullable = false)
    @Builder.Default
    private int stockQuantity = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", columnDefinition = "jsonb")
    private String specs;

    private String thumbnail;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "update_at")
    @UpdateTimestamp
    private Instant updateAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @ToString.Exclude
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @ToString.Exclude
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Wishlist> wishlists = new ArrayList<>();
}
