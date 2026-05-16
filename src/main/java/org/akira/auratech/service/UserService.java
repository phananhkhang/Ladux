package org.akira.auratech.service;

import org.akira.auratech.dto.UserRequest;
import org.akira.auratech.dto.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse getUserById(int id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getActiveUsers();

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(int id, UserRequest request);

    void deleteUserById(int id);
}
