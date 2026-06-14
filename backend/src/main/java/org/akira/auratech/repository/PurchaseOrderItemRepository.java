package org.akira.auratech.repository;

import java.util.List;

import org.akira.auratech.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Integer> {

    List<PurchaseOrderItem> findByPurchaseOrderId(Integer purchaseOrderId);
}
