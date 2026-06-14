package org.akira.auratech.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.akira.auratech.dto.request.RegisterRequest;
import org.akira.auratech.dto.request.UserAdminUpdateRequest;
import org.akira.auratech.dto.request.UserProfileUpdateRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.Customer;
import org.akira.auratech.model.Role;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.CustomerLevel;
import org.akira.auratech.model.enums.RoleName;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.RoleRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.RefreshTokenService;
import org.akira.auratech.service.UserService;
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

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    private final CartRepository cartRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    @Value("${app.upload.avatar-dir:avatars}")
    private String avatarUploadDir;

    private static final Map<String, String> ALLOWED_IMAGE_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

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

        if (request.email() != null) {
            String email = request.email().trim();
            if (repo.existsByEmailAndIdNot(email, id)) {
                throw new BusinessRuleException("Email nay da ton tai trong DB. Hay dung email khac.");
            }
            user.setEmail(email);
        }
        if (request.username() != null) {
            String username = request.username().trim();
            if (repo.existsByUsernameAndIdNot(username, id)) {
                throw new BusinessRuleException("Username nay da ton tai trong DB. Hay dung username khac.");
            }
            user.setUsername(username);
        }
        if (request.password() != null) {
            user.setPassword(encoder.encode(request.password()));
            // Doi mat khau -> bump tokenVersion (tren entity managed) + thu hoi refresh token.
            user.setTokenVersion(user.getTokenVersion() + 1);
            refreshTokenService.revokeAllRefreshTokens(id);
        }
        if (request.fullName() != null) {
            getOrCreateCustomer(user).setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            getOrCreateCustomer(user).setPhone(request.phone());
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
        deleteStoredAvatarIfLocal(customer.getAvatarUrl());
        customer.setAvatarUrl(storeAvatar(file));
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

    private Set<Role> resolveRoles(List<Integer> roleIds) {        if (roleIds == null) {
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

    private String storeAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("File avatar khong duoc de trong");
        }

        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = ALLOWED_IMAGE_TYPES.get(contentType);
        if (extension == null) {
            throw new BusinessRuleException("Chi ho tro avatar JPG, PNG, WEBP hoac GIF");
        }

        String filename = UUID.randomUUID() + extension;
        Path avatarDirectory = Path.of(uploadRoot, avatarUploadDir).toAbsolutePath().normalize();
        Path target = avatarDirectory.resolve(filename).normalize();
        if (!target.startsWith(avatarDirectory)) {
            throw new BusinessRuleException("Duong dan upload avatar khong hop le");
        }

        try {
            Files.createDirectories(avatarDirectory);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessRuleException("Khong the luu file avatar");
        }

        return "/uploads/" + avatarUploadDir + "/" + filename;
    }

    private void deleteStoredAvatarIfLocal(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank() || !avatarUrl.startsWith("/uploads/")) {
            return;
        }
        String relativePath = avatarUrl.substring("/uploads/".length());
        Path storedFile = Path.of(uploadRoot).toAbsolutePath().normalize().resolve(relativePath).normalize();
        Path uploadDirectory = Path.of(uploadRoot).toAbsolutePath().normalize();
        if (!storedFile.startsWith(uploadDirectory)) {
            return;
        }
        try {
            Files.deleteIfExists(storedFile);
        } catch (IOException ignored) {
            // Khong chan upload moi neu file cu khong xoa duoc
        }
    }
}
