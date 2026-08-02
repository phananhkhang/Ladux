package org.akira.ladux.repository;

import org.akira.ladux.model.PhoneVerification;
import org.akira.ladux.model.enums.PhoneVerificationStatus;
import org.akira.ladux.model.enums.PhoneVerificationPurpose;
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
    findFirstByCustomerIdAndPurposeOrderByCreatedAtDesc(
            Integer customerId,
            PhoneVerificationPurpose purpose
    );

    boolean existsByVerificationIdAndCustomerId(
            String verificationId,
            Integer customerId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PhoneVerification>
    findByVerificationIdAndCustomerIdAndPurpose(
            String verificationId,
            Integer customerId,
            PhoneVerificationPurpose purpose
    );

    @Modifying
    @Query("""
        update PhoneVerification p
           set p.status = :status
         where p.customerId = :customerId
           and p.purpose = :purpose
           and (
               p.status = org.akira.ladux.model.enums.PhoneVerificationStatus.PENDING
               or p.status = org.akira.ladux.model.enums.PhoneVerificationStatus.VERIFIED
           )
           and p.consumedAt is null
    """)
    int invalidateActiveByCustomerIdAndPurpose(
            @Param("customerId") Integer customerId,
            @Param("purpose") PhoneVerificationPurpose purpose,
            @Param("status") PhoneVerificationStatus status
    );
}
