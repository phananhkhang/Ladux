package org.akira.auratech.service;

import org.akira.auratech.model.UserAddress;

import java.util.List;

public interface UserAddressService {
    List<UserAddress> getAllUserAddresses();

    UserAddress getUserAddressById(int id);

    List<UserAddress> getUserAddressesByUserId(int userId);

    List<UserAddress> getDefaultAddressesByUserId(int userId);

    UserAddress createUserAddress(UserAddress address);

    UserAddress updateUserAddress(UserAddress address);

    void deleteUserAddressById(int id);
}
