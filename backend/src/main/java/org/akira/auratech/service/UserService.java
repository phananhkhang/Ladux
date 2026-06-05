package org.akira.auratech.service;

import org.akira.auratech.dto.request.RegisterRequest;
import org.akira.auratech.dto.request.UserAdminUpdateRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getActiveUsers(Pageable pageable);

    UserResponse updateUser(int id, UserAdminUpdateRequest request);

    UserResponse updateAvatar(int id, MultipartFile file);

    void deleteUserById(int id);

    UserResponse savedUser(RegisterRequest request);
}
