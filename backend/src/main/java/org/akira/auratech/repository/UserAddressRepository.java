package org.akira.auratech.repository;

import jakarta.persistence.LockModeType;
import org.akira.auratech.model.UserAddress;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {
    @EntityGraph(attributePaths = {"user"})
    @Override
    List<UserAddress> findAll();

    @EntityGraph(attributePaths = {"user"})
    List<UserAddress> findByUserId(Integer userId);

    @EntityGraph(attributePaths = {"user"})
    List<UserAddress> findByUserIdAndIsDefaultTrue(Integer userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<UserAddress> findByUserIdAndId(int userId, int addressId);

    @EntityGraph(attributePaths = {"user"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from UserAddress a where a.user.id = :userId")
    List<UserAddress> findByUserIdForUpdate(@Param("userId") Integer userId);

    @EntityGraph(attributePaths = {"user"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from UserAddress a where a.user.id = :userId and a.id = :addressId")
    Optional<UserAddress> findByUserIdAndIdForUpdate(@Param("userId") int userId, @Param("addressId") int addressId);

    @Modifying(flushAutomatically = true)
    @Query("update UserAddress a set a.isDefault = false where a.user.id = :userId and a.isDefault = true")
    int clearDefaultByUserId(@Param("userId") Integer userId);
}

