package org.akira.ladux.repository;

import java.util.Optional;

import org.akira.ladux.model.PurchaseOrder;
import org.akira.ladux.model.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    @EntityGraph(attributePaths = {"supplier", "createdBy"})
    Page<PurchaseOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"supplier", "createdBy"})
    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"supplier", "createdBy"})
    Page<PurchaseOrder> findBySupplierId(Integer supplierId, Pageable pageable);

    @EntityGraph(attributePaths = {"supplier", "createdBy", "items", "items.product"})
    @Query("select po from PurchaseOrder po where po.id = :id")
    Optional<PurchaseOrder> findWithItemsById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"supplier", "createdBy", "items", "items.product"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select po from PurchaseOrder po where po.id = :id")
    Optional<PurchaseOrder> findWithItemsByIdForUpdate(@Param("id") Integer id);
}
