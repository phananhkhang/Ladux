package org.akira.ladux.dto.response;

import java.io.Serializable;
import java.util.List;

import org.akira.ladux.model.Customer;
import org.akira.ladux.model.User;

public record UserResponse(
        Integer id,
        String email,
        String username,
        String fullName,
        String phone,
        String avatar,
        boolean isActive,
        List<String> roles
) implements Serializable {
    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        List<String> roleNames = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(role -> role.getName().name())
                .toList();

        // Ho so (ten/sdt/avatar) nam o Customer (shared PK voi User).
        Customer customer = user.getCustomer();
        String fullName = customer == null ? null : customer.getFullName();
        String phone = customer == null ? null : customer.getPhone();
        String avatar = customer == null ? null : customer.getAvatarUrl();

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                fullName,
                phone,
                avatar,
                user.isActive(),
                roleNames
        );
    }
}
