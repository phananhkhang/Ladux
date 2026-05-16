package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.UserAddressRequest;
import org.akira.auratech.dto.UserAddressResponse;
import org.akira.auratech.model.User;
import org.akira.auratech.model.UserAddress;
import org.akira.auratech.repository.UserAddressRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserAddressService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl implements UserAddressService {
    private final UserAddressRepository repo;
    private final UserRepository userRepository;

    @Override
    public List<UserAddressResponse> getAllUserAddresses() {
        return repo.findAll().stream()
                .map(UserAddressResponse::fromEntity)
                .toList();
    }

    @Override
    public UserAddressResponse getUserAddressById(int id) {
        return UserAddressResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public List<UserAddressResponse> getUserAddressesByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(UserAddressResponse::fromEntity)
                .toList();
    }

    @Override
    public List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId) {
        return repo.findByUserIdAndIsDefaultTrue(userId).stream()
                .map(UserAddressResponse::fromEntity)
                .toList();
    }

    @Override
    public UserAddressResponse createUserAddress(UserAddressRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            return null;
        }
        UserAddress address = UserAddress.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .district(request.getDistrict())
                .city(request.getCity())
                .isDefault(request.getIsDefault() == null ? false : request.getIsDefault())
                .build();
        return UserAddressResponse.fromEntity(repo.save(address));
    }

    @Override
    public UserAddressResponse updateUserAddress(int id, UserAddressRequest request) {
        UserAddress address = repo.findById(id).orElse(null);
        if (address == null) {
            return null;
        }
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return null;
            }
            address.setUser(user);
        }
        if (request.getReceiverName() != null) {
            address.setReceiverName(request.getReceiverName());
        }
        if (request.getPhone() != null) {
            address.setPhone(request.getPhone());
        }
        if (request.getStreet() != null) {
            address.setStreet(request.getStreet());
        }
        if (request.getDistrict() != null) {
            address.setDistrict(request.getDistrict());
        }
        if (request.getCity() != null) {
            address.setCity(request.getCity());
        }
        if (request.getIsDefault() != null) {
            address.setDefault(request.getIsDefault());
        }
        return UserAddressResponse.fromEntity(repo.save(address));
    }

    @Override
    public void deleteUserAddressById(int id) {
        repo.deleteById(id);
    }
}
