package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.RegisterRequest;
import org.akira.ladux.dto.user.request.UserAdminUpdateRequest;
import org.akira.ladux.dto.user.request.UserUpdatePassword;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    PageResponse<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    PageResponse<UserResponse> getActiveUsers(Pageable pageable);

    UserResponse updateUser(int id, UserAdminUpdateRequest request);

    void changePassword(Integer id, UserUpdatePassword request);

    UserResponse updateAvatar(int id, MultipartFile file);

    void deleteUserById(int id);

    UserResponse savedUser(RegisterRequest request);

    UserResponse uploadAvatar(Integer id, MultipartFile file);

    PageResponse<UserResponse> searchUserByNameOrPhone(String name, String phone, Pageable pageable);
}
