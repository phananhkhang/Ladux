package org.akira.auratech.model;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(nullable = false, unique = true, length = 60)
    private String username;
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(length = 20)
    private String phone;

    private String avatar;

    @Builder.Default // Mặc định là true khi tạo mới user, có thể set false để khóa tài khoản
    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private Instant updateAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @ToString.Exclude
    @Builder.Default
    private Set<Role> roles = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) // orphanRemoval là nếu xóa user thì xóa luôn địa chỉ của user đó, tránh rác dữ liệu
    @ToString.Exclude
    @Builder.Default
    private List<UserAddress> addresses = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Wishlist> wishlists = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
