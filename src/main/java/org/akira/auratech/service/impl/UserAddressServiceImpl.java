package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.UserAddress;
import org.akira.auratech.repository.UserAddressRepository;
import org.akira.auratech.service.UserAddressService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl implements UserAddressService {
    private final UserAddressRepository repo;

    @Override
    public List<UserAddress> getAllUserAddresses() {
        return repo.findAll();
    }

    @Override
    public UserAddress getUserAddressById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<UserAddress> getUserAddressesByUserId(int userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public List<UserAddress> getDefaultAddressesByUserId(int userId) {
        return repo.findByUserIdAndIsDefaultTrue(userId);
    }

    @Override
    public UserAddress createUserAddress(UserAddress address) {
        return repo.save(address);
    }

    @Override
    public UserAddress updateUserAddress(UserAddress address) {
        return repo.save(address);
    }

    @Override
    public void deleteUserAddressById(int id) {
        repo.deleteById(id);
    }
}

