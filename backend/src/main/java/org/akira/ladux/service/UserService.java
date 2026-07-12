package org.akira.ladux.service;

import org.akira.ladux.dto.request.RegisterRequest;
import org.akira.ladux.dto.request.UserAdminUpdateRequest;
import org.akira.ladux.dto.request.UserProfileUpdateRequest;
import org.akira.ladux.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getActiveUsers(Pageable pageable);

    UserResponse updateUser(int id, UserAdminUpdateRequest request);

    UserResponse updateProfile(int id, UserProfileUpdateRequest request);

    UserResponse updateAvatar(int id, MultipartFile file);

    void deleteUserById(int id);

    UserResponse savedUser(RegisterRequest request);

    UserResponse uploadAvatar(Integer id, MultipartFile file);
}
