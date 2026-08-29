package org.akira.ladux.repository;

import java.util.Optional;

import org.akira.ladux.model.UserMfaMethod;
import org.akira.ladux.model.enums.MfaType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMfaMethodRepository extends JpaRepository<UserMfaMethod, Long> {

    Optional<UserMfaMethod> findFirstByUserIdAndTypeAndEnabledTrueOrderByIdDesc(
            Integer userId,
            MfaType type
    );
}
