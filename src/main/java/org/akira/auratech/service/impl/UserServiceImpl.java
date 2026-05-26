package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.RoleRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return repo.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(int id) {
        return UserResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return UserResponse.fromEntity(repo.findByEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getActiveUsers(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        Set<Role> roles = resolveRoles(request.roleIds());
        if (request.roleIds() != null && roles == null) {
            return null;
        }
        User user = User.builder()
                .email(request.email())
                .password(request.password())
                .fullName(request.fullName())
                .phone(request.phone())
                .avatar(request.avatar())
                .isActive(request.isActive() == null ? true : request.isActive())
                .roles(roles == null ? new LinkedHashSet<>() : roles)
                .build();
        return UserResponse.fromEntity(repo.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(int id, UserRequest request) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.avatar() != null) {
            user.setAvatar(request.avatar());
        }
        if (request.isActive() != null) {
            user.setActive(request.isActive());
        }
        if (request.roleIds() != null) {
            Set<Role> roles = resolveRoles(request.roleIds());
            if (roles == null) {
                return null;
            }
            user.setRoles(roles);
        }
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
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
