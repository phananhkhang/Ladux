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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl implements UserAddressService {
    private final UserAddressRepository repo;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserAddressResponse> getAllUserAddresses(Pageable pageable) {
        return repo.findAll(pageable)
                .map(UserAddressResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAddressResponse getUserAddressById(int userId, int addressId) {
        return UserAddressResponse.fromEntity(repo.findByUserIdAndId(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + addressId)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAddressResponse> getUserAddressesByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(UserAddressResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId) {
        return repo.findByUserIdAndIsDefaultTrue(userId).stream()
                .map(UserAddressResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public UserAddressResponse createUserAddress(int userId, UserAddressRequest request) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));


        if (Boolean.TRUE.equals(request.isDefault())) {
            repo.findByUserIdForUpdate(userId);
            clearDefaultAddresses(userId);
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
    @Transactional
    public UserAddressResponse updateUserAddress(int userId, int addressId, UserAddressRequest request) { // 💡 Nhận cả userId và addressId
        userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        UserAddress address = repo.findByUserIdAndIdForUpdate(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + addressId));

        if (request.receiverName() != null) address.setReceiverName(request.receiverName());
        if (request.phone() != null) address.setPhone(request.phone());
        if (request.street() != null) address.setStreet(request.street());
        if (request.district() != null) address.setDistrict(request.district());
        if (request.city() != null) address.setCity(request.city());

        if (request.isDefault() != null) {
            if (Boolean.TRUE.equals(request.isDefault())) {
                repo.findByUserIdForUpdate(userId);
                clearDefaultAddresses(userId);
            }
            address.setDefault(request.isDefault());
        }

        return UserAddressResponse.fromEntity(address);
    }

    @Override
    @Transactional
    public void deleteUserAddressById(int userId, int addressId) {
        UserAddress address = repo.findByUserIdAndIdForUpdate(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + addressId));
        repo.delete(address);
    }
    private void clearDefaultAddresses(Integer userId) {
        repo.clearDefaultByUserId(userId);
    }
}
