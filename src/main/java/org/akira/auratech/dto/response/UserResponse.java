package org.akira.auratech.dto.response;

import org.akira.auratech.model.User;
import java.time.Instant;
import java.util.List;

public record UserResponse(
        Integer id,
        String email,
        String fullName,
        String phone,
        String avatar,
        boolean isActive,
        Instant createdAt,
        List<String> roles
) {
    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        List<String> roleNames = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(role -> role.getName().name())
                .toList();
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatar(),
                user.isActive(),
                user.getCreatedAt(),
                roleNames
        );
    }
}
