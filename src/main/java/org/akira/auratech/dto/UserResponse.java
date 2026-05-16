package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.User;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class UserResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private boolean isActive;
    private Instant createdAt;
    private List<Integer> roleIds;

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        List<Integer> roleIds = user.getRoles() == null ? List.of() : user.getRoles().stream()
                .map(role -> role.getId())
                .toList();
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .roleIds(roleIds)
                .build();
    }
}

