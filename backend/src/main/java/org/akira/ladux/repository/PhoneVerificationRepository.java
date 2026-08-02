package org.akira.ladux.repository;

import org.akira.ladux.model.PhoneVerification;
import org.akira.ladux.model.enums.PhoneVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import jakarta.persistence.LockModeType;

public interface PhoneVerificationRepository
        extends JpaRepository<PhoneVerification, Long> {

    Optional<PhoneVerification>
    findFirstByCustomerIdOrderByCreatedAtDesc(
            Integer customerId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PhoneVerification>
    findByVerificationIdAndCustomerId(
            String verificationId,
            Integer customerId
    );

    @Modifying
    @Query("""
        update PhoneVerification p
           set p.status = :status
         where p.customerId = :customerId
           and p.status =
               org.akira.ladux.model.enums.PhoneVerificationStatus.PENDING
    """)
    int invalidatePendingByCustomerId(
            @Param("customerId") Integer customerId,
            @Param("status") PhoneVerificationStatus status
    );
}
