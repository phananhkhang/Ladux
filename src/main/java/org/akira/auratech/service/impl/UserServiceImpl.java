package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.UserRequest;
import org.akira.auratech.dto.UserResponse;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.RoleRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    private final RoleRepository roleRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return repo.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Override
    public UserResponse getUserById(int id) {
        return UserResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id)));
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return UserResponse.fromEntity(repo.findByEmail(email));
    }

    @Override
    public List<UserResponse> getActiveUsers() {
        return repo.findByIsActiveTrue().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Override
    public UserResponse createUser(UserRequest request) {
        Set<Role> roles = resolveRoles(request.getRoleIds());
        if (request.getRoleIds() != null && roles == null) {
            return null;
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(request.getPasswordHash())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .isActive(request.getIsActive() == null ? true : request.getIsActive())
                .roles(roles == null ? new LinkedHashSet<>() : roles)
                .build();
        return UserResponse.fromEntity(repo.save(user));
    }

    @Override
    public UserResponse updateUser(int id, UserRequest request) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPasswordHash() != null) {
            user.setPasswordHash(request.getPasswordHash());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }
        if (request.getRoleIds() != null) {
            Set<Role> roles = resolveRoles(request.getRoleIds());
            if (roles == null) {
                return null;
            }
            user.setRoles(roles);
        }
        return UserResponse.fromEntity(repo.save(user));
    }

    @Override
    public void deleteUserById(int id) {
        repo.deleteById(id);
    }

    private Set<Role> resolveRoles(List<Integer> roleIds) {
        if (roleIds == null) {
            return null;
        }
        Set<Role> roles = new LinkedHashSet<>();
        for (Integer roleId : roleIds) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay role voi id = " + roleId));
            roles.add(role);
        }
        return roles;
    }
}
