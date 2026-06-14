package org.akira.auratech.repository;

import org.akira.auratech.dto.response.SupplierResponse;
import org.akira.auratech.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    Page<Supplier> findByIsActiveTrue(Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT new org.akira.auratech.dto.response.SupplierResponse(" +
           "s.id, s.name, s.address, s.phone, s.email, s.isActive, s.createdAt, s.updatedAt) " +
           "FROM Supplier s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) OR " +
           "(:phone IS NULL OR s.phone = :phone)")
    Page<SupplierResponse> searchByNameOrPhone(@Param("name") String name,
                                               @Param("phone") String phone,
                                               Pageable pageable);
}
