package org.akira.ladux.service;

import org.akira.ladux.dto.request.admin.AdminPurchaseOrderReceiveRequest;
import org.akira.ladux.dto.request.admin.PurchaseOrderCreateRequest;
import org.akira.ladux.dto.request.admin.PurchaseOrderStatusUpdateRequest;
import org.akira.ladux.dto.response.admin.PurchaseOrderResponse;
import org.akira.ladux.model.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {

    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderCreateRequest request, Integer createdByUserId);

    PurchaseOrderResponse getPurchaseOrderById(int id);

    Page<PurchaseOrderResponse> getAllPurchaseOrders(Pageable pageable);

    Page<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status, Pageable pageable);

    Page<PurchaseOrderResponse> getPurchaseOrdersBySupplier(int supplierId, Pageable pageable);

    PurchaseOrderResponse updateStatus(int id, PurchaseOrderStatusUpdateRequest request);

    /** Nhan hang (toan bo/tung phan): cong ton kho + ghi stock movement + cap nhat trang thai. */
    PurchaseOrderResponse receiveGoods(int id, AdminPurchaseOrderReceiveRequest request, Integer receivedByUserId);
}
