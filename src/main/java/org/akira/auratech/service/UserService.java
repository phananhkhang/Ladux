package org.akira.auratech.service;

import org.akira.auratech.dto.request.UserRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getActiveUsers(Pageable pageable);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(int id, UserRequest request);

    void deleteUserById(int id);
}
