package org.akira.ladux.dto.user.response;

import java.io.Serializable;
import java.math.BigDecimal;

import org.akira.ladux.model.Customer;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.CustomerLevel;

public record CustomerResponse(
        Integer id,
        Integer userId,
        String email,
        String username,
        String fullName,
        String phone,
        String avatarUrl,
        Long loyaltyPoints,
        CustomerLevel level,
        BigDecimal totalSpent
) implements Serializable {
    public static CustomerResponse fromEntity(Customer customer) {
        if (customer == null) {
            return null;
        }
        User user = customer.getUser();
        return new CustomerResponse(
                customer.getId(),
                user == null ? null : user.getId(),
                user == null ? null : customer.getEmail(),
                user == null ? null : user.getUsername(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getAvatarUrl(),
                customer.getLoyaltyPoints(),
                customer.getLevel(),
                customer.getTotalSpent()
        );
    }
}
