package org.akira.auratech.controller;

import org.akira.auratech.model.UserAddress;
import org.akira.auratech.service.UserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-addresses")
public class UserAddressController {
    @Autowired
    UserAddressService service;

    @GetMapping("/all")
    public List<UserAddress> getAllUserAddresses() {
        return service.getAllUserAddresses();
    }

    @GetMapping("/{id}")
    public UserAddress getUserAddressById(@PathVariable int id) {
        return service.getUserAddressById(id);
    }

    @GetMapping("/user/{userId}")
    public List<UserAddress> getUserAddressesByUserId(@PathVariable int userId) {
        return service.getUserAddressesByUserId(userId);
    }

    @GetMapping("/user/{userId}/default")
    public List<UserAddress> getDefaultAddressesByUserId(@PathVariable int userId) {
        return service.getDefaultAddressesByUserId(userId);
    }

    @PostMapping
    public UserAddress createUserAddress(@RequestBody UserAddress address) {
        return service.createUserAddress(address);
    }

    @PutMapping
    public UserAddress updateUserAddress(@RequestBody UserAddress address) {
        return service.updateUserAddress(address);
    }

    @DeleteMapping("/{id}")
    public void deleteUserAddressById(@PathVariable int id) {
        service.deleteUserAddressById(id);
    }
}

