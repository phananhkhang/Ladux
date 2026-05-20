package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.model.User;
import org.akira.auratech.model.UserAddress;
import org.akira.auratech.repository.UserAddressRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.UserAddressService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public UserAddressResponse createUserAddress(int userId, UserAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));


        if (Boolean.TRUE.equals(request.isDefault())) {
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
        UserAddress address = repo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user address voi id = " + addressId));

        // CHỐT CHẶN BẢO MẬT: Kiểm tra xem địa chỉ này có đúng là của User đang login không
        if (address.getUser() == null || !address.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Dia chi nay khong thuoc ve user dang thao tac");
        }

        if (request.receiverName() != null) address.setReceiverName(request.receiverName());
        if (request.phone() != null) address.setPhone(request.phone());
        if (request.street() != null) address.setStreet(request.street());
        if (request.district() != null) address.setDistrict(request.district());
        if (request.city() != null) address.setCity(request.city());

        if (request.isDefault() != null) {
            if (Boolean.TRUE.equals(request.isDefault())) {
                clearDefaultAddresses(userId);
            }
            address.setDefault(request.isDefault());
        }

        return UserAddressResponse.fromEntity(address);
    }

    @Override
    public void deleteUserAddressById(int id) {
        repo.deleteById(id);
    }

    private void clearDefaultAddresses(Integer userId) {
        repo.findByUserIdAndIsDefaultTrue(userId).forEach(address -> address.setDefault(false));
    }
}
