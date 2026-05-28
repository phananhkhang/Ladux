package org.akira.auratech.service;

import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;

import java.util.List;

public interface UserAddressService {
    List<UserAddressResponse> getAllUserAddresses();

    UserAddressResponse getUserAddressById(int userId, int addressId);

    List<UserAddressResponse> getUserAddressesByUserId(int userId);

    List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId);

    UserAddressResponse createUserAddress(int userId, UserAddressRequest request);

    UserAddressResponse updateUserAddress(int userId, int addressId, UserAddressRequest request);

    void deleteUserAddressById(int userId, int addressId);
}
