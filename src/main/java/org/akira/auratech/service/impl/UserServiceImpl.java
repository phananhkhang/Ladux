package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repo;

    @Override
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    @Override
    public User getUserById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public User getUserByEmail(String email) {
        return repo.findByEmail(email);
    }

    @Override
    public List<User> getActiveUsers() {
        return repo.findByIsActiveTrue();
    }

    @Override
    public User createUser(User user) {
        return repo.save(user);
    }

    @Override
    public User updateUser(User user) {
        return repo.save(user);
    }

    @Override
    public void deleteUserById(int id) {
        repo.deleteById(id);
    }
}

