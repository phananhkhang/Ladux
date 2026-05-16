package org.akira.auratech.repository;

import org.akira.auratech.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {
    List<UserAddress> findByUserId(Integer userId);

    List<UserAddress> findByUserIdAndIsDefaultTrue(Integer userId);
}

