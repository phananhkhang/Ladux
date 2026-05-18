package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.akira.auratech.model.User;
import org.akira.auratech.model.UserAddress;
import org.akira.auratech.repository.UserAddressRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserAddressService;
import org.akira.auratech.exception.ResourceNotFoundException;
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
        return UserAddressResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + id)));
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
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
        if (user == null) {
            return null;
        }
        UserAddress address = UserAddress.builder()
                .user(user)
                .receiverName(request.receiverName())
                .phone(request.phone())
                .street(request.street())
                .district(request.district())
                .city(request.city())
                .isDefault(request.isDefault() == null ? false : request.isDefault())
                .build();
        return UserAddressResponse.fromEntity(repo.save(address));
    }

    @Override
    public UserAddressResponse updateUserAddress(int id, UserAddressRequest request) {
        UserAddress address = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + id));
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
            address.setUser(user);
        }
        if (request.receiverName() != null) {
            address.setReceiverName(request.receiverName());
        }
        if (request.phone() != null) {
            address.setPhone(request.phone());
        }
        if (request.street() != null) {
            address.setStreet(request.street());
        }
        if (request.district() != null) {
            address.setDistrict(request.district());
        }
        if (request.city() != null) {
            address.setCity(request.city());
        }
        if (request.isDefault() != null) {
            address.setDefault(request.isDefault());
        }
        return UserAddressResponse.fromEntity(repo.save(address));
    }

    @Override
    public void deleteUserAddressById(int id) {
        repo.deleteById(id);
    }
}
