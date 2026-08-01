package org.akira.ladux.service.impl;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.akira.ladux.dto.user.request.RegisterRequest;
import org.akira.ladux.dto.user.request.UserAdminUpdateRequest;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Cart;
import org.akira.ladux.model.Customer;
import org.akira.ladux.model.Role;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.CustomerLevel;
import org.akira.ladux.model.enums.RoleName;
import org.akira.ladux.repository.CartRepository;
import org.akira.ladux.repository.RoleRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.FileStorageService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import org.akira.ladux.dto.user.request.UserProfileUpdateRequest;
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    private final CartRepository cartRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final RefreshTokenService refreshTokenService;
    private final FileStorageService fileStorage;

    @Value("${app.upload.avatar-dir:avatar}")
    private String avatarUploadDir;

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse savedUser(RegisterRequest request) {
        String email = request.email().trim();
        String username = request.username().trim();

        if (repo.existsByEmail(email)) {
            throw new BusinessRuleException("Email nay da ton tai trong DB. Hay dung email khac.");
        }
        if (repo.existsByUsername(username)) {
            throw new BusinessRuleException("Username nay da ton tai trong DB. Hay dung username khac.");
        }

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER);
        if (customerRole == null) {
            throw new ResourceNotFoundException("Khong tim thay role CUSTOMER");
        }
        User user = User.builder()
                .email(email)
                .username(username)
                .password(encoder.encode(request.password()))
                .isActive(true)
                .roles(Set.of(customerRole))
                .build();
        // Ho so khach hang (shared PK voi User) — luu ten/sdt.
        Customer customer = Customer.builder()
                .user(user)
                .fullName(request.fullName().trim())
                .phone(request.phone())
                .level(CustomerLevel.BROWSER)
                .loyaltyPoints(0L)
                .totalSpent(BigDecimal.ZERO)
                .build();
        user.setCustomer(customer);
        User saved = repo.save(user); // cascade ALL -> luu luon Customer (MapsId)
        cartRepository.save(Cart.builder().user(saved).build());
        return UserResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return repo.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "'id:' + #id")
    public UserResponse getUserById(int id) {
        return UserResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "'email:' + #email")
    public UserResponse getUserByEmail(String email) {
        return UserResponse.fromEntity(repo.findByEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "'active:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<UserResponse> getActiveUsers(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateUser(int id, UserAdminUpdateRequest request) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        if (request.username() != null) {
            user.setUsername(request.username());
        }
        if (request.password() != null) {
            user.setPassword(encoder.encode(request.password()));
            // Doi mat khau -> bump tokenVersion (tren entity managed) + thu hoi refresh token.
            user.setTokenVersion(user.getTokenVersion() + 1);
            refreshTokenService.revokeAllRefreshTokens(id);
        }
        if (request.fullName() != null) {
            getOrCreateCustomer(user).setFullName(request.fullName());
        }
        if (request.phone() != null) {
            getOrCreateCustomer(user).setPhone(request.phone());
        }
        if (request.avatar() != null) {
            getOrCreateCustomer(user).setAvatarUrl(request.avatar());
        }
        if (request.isActive() != null) {
            user.setActive(request.isActive());
            // Khoa tai khoan -> bump tokenVersion + thu hoi refresh token de da user ra ngay.
            if (!request.isActive()) {
                user.setTokenVersion(user.getTokenVersion() + 1);
                refreshTokenService.revokeAllRefreshTokens(id);
            }
        }
        if (request.roleIds() != null) {
            if (request.roleIds().isEmpty()) {
                throw new BusinessRuleException("User phai co it nhat 1 role");
            }
            Set<Role> roles = resolveRoles(request.roleIds());
            user.setRoles(roles);
        }
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateProfile(int id, UserProfileUpdateRequest request) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));

        Customer customer = getOrCreateCustomer(user);

        if (request.fullName() != null && !request.fullName().isBlank()) {
            customer.setFullName(request.fullName().trim());
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            customer.setPhone(request.phone().trim());
        }

        // Logic chinh sua mat khau neu nguoi dung nhap mat khau
        boolean hasPasswordInput = (request.currentPassword() != null && !request.currentPassword().isBlank())
                || (request.newPassword() != null && !request.newPassword().isBlank())
                || (request.confirmPassword() != null && !request.confirmPassword().isBlank());

        if (hasPasswordInput) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()
                    || request.newPassword() == null || request.newPassword().isBlank()
                    || request.confirmPassword() == null || request.confirmPassword().isBlank()) {
                throw new BusinessRuleException("Vui lòng điền đầy đủ các trường mật khẩu để thay đổi mật khẩu.");
            }
            if (!encoder.matches(request.currentPassword(), user.getPassword())) {
                throw new BusinessRuleException("Mật khẩu hiện tại không đúng.");
            }
            if (!request.newPassword().equals(request.confirmPassword())) {
                throw new BusinessRuleException("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            }
            if (request.newPassword().length() < 8) {
                throw new BusinessRuleException("Mật khẩu mới phải có tối thiểu 8 ký tự.");
            }
            user.setPassword(encoder.encode(request.newPassword()));
        }

        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateAvatar(int id, MultipartFile file) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + id));
        Customer customer = getOrCreateCustomer(user);
        fileStorage.deleteIfLocal(customer.getAvatarUrl());
        customer.setAvatarUrl(fileStorage.store(avatarUploadDir, file));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse uploadAvatar(Integer id, MultipartFile file) {
        if (id == null) {
            throw new BusinessRuleException("User id khong duoc de trong");
        }
        return updateAvatar(id, file);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUserById(int id) {
        repo.deleteById(id);
    }

    /** Lay ho so Customer cua user, tao moi (gan vao user, cascade) neu chua co. */
    private Customer getOrCreateCustomer(User user) {
        Customer customer = user.getCustomer();
        if (customer == null) {
            customer = Customer.builder()
                    .user(user)
                    .level(CustomerLevel.BROWSER)
                    .loyaltyPoints(0L)
                    .totalSpent(BigDecimal.ZERO)
                    .build();
            user.setCustomer(customer);
        }
        return customer;
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
