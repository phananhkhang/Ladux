package org.akira.auratech.repository;

import jakarta.persistence.LockModeType;
import org.akira.auratech.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @EntityGraph(attributePaths = {"roles"})
    User findByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    @Override
    Page<User> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"roles"})
    @Override
    Optional<User> findById(Integer id);

    @EntityGraph(attributePaths = {"roles"})
    Page<User> findByIsActiveTrue(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
