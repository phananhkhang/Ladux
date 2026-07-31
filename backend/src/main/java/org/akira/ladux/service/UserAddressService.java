package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.UserAddressRequest;
import org.akira.ladux.dto.user.response.UserAddressResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserAddressService {
    Page<UserAddressResponse> getAllUserAddresses(Pageable pageable);

    UserAddressResponse getUserAddressById(int userId, int addressId);

    /** For admin use: fetch any address by ID without ownership restriction */
    UserAddressResponse getUserAddressByIdForAdmin(int addressId);

    List<UserAddressResponse> getUserAddressesByUserId(int userId);

    List<UserAddressResponse> getDefaultUserAddressesByUserId(int userId);

    UserAddressResponse createUserAddress(int userId, UserAddressRequest request);

    UserAddressResponse updateUserAddress(int userId, int addressId, UserAddressRequest request);

    void deleteUserAddressById(int userId, int addressId);
}
