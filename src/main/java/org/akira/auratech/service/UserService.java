package org.akira.auratech.service;

import org.akira.auratech.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(int id);

    User getUserByEmail(String email);

    List<User> getActiveUsers();

    User createUser(User user);

    User updateUser(User user);

    void deleteUserById(int id);
}
