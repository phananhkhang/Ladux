package org.akira.auratech.service;

import org.akira.auratech.dto.UserAddressRequest;
import org.akira.auratech.dto.UserAddressResponse;

import java.util.List;

public interface UserAddressService {
    List<UserAddressResponse> getAllUserAddresses();

    UserAddressResponse getUserAddressById(int id);

    List<UserAddressResponse> getUserAddressesByUserId(int userId);

    List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId);

    UserAddressResponse createUserAddress(UserAddressRequest request);

    UserAddressResponse updateUserAddress(int id, UserAddressRequest request);

    void deleteUserAddressById(int id);
}
