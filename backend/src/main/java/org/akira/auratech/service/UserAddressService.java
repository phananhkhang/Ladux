package org.akira.auratech.service;

import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserAddressService {
    Page<UserAddressResponse> getAllUserAddresses(Pageable pageable);

    UserAddressResponse getUserAddressById(int userId, int addressId);

    List<UserAddressResponse> getUserAddressesByUserId(int userId);

    List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId);

    UserAddressResponse createUserAddress(int userId, UserAddressRequest request);

    UserAddressResponse updateUserAddress(int userId, int addressId, UserAddressRequest request);

    void deleteUserAddressById(int userId, int addressId);
}
