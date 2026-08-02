package org.akira.ladux.dto.user.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import org.akira.ladux.model.Customer;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.CustomerLevel;

// Danh cho Admin
public record UserResponse(
        Integer id,
        String email,
        String username,
        String fullName,
        String phone,
        String avatar,
        Long loyaltyPoints,
        CustomerLevel level,
        BigDecimal totalSpent,
        boolean isActive,
        List<String> roles) implements Serializable {
    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        List<String> roleNames = user.getRoles() == null ? List.of()
                : user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList();

        Customer customer = user.getCustomer();
        String fullName = customer == null ? null : customer.getFullName();
        String phone = customer == null ? null : customer.getPhone();
        String avatar = customer == null ? null : customer.getAvatarUrl();
        Long loyaltyPoints = customer == null ? 0L : customer.getLoyaltyPoints();
        CustomerLevel level = customer == null ? CustomerLevel.BROWSER : customer.getLevel();
        BigDecimal totalSpent = customer == null ? BigDecimal.ZERO : customer.getTotalSpent();

        return new UserResponse(
                user.getId(),
                customer == null ? null : customer.getEmail(),
                user.getUsername(),
                fullName,
                phone,
                avatar,
                loyaltyPoints,
                level,
                totalSpent,
                user.isActive(),
                roleNames);
    }
}
