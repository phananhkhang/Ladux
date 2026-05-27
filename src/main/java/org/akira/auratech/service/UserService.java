package org.akira.auratech.service;

import jakarta.validation.Valid;
import org.akira.auratech.dto.request.UserRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getActiveUsers(Pageable pageable);

    UserResponse updateUser(int id, UserRequest request);

    void deleteUserById(int id);

    UserResponse savedUser(UserRequest request);
}
