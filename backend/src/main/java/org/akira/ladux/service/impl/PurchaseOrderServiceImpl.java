package org.akira.ladux.service.impl;

import java.math.BigDecimal;

import org.akira.ladux.dto.request.admin.AdminPurchaseOrderReceiveRequest;
import org.akira.ladux.dto.request.admin.AdminPurchaseOrderItemRequest;
import org.akira.ladux.dto.request.admin.PurchaseOrderCreateRequest;
import org.akira.ladux.dto.request.admin.PurchaseOrderStatusUpdateRequest;
import org.akira.ladux.dto.response.admin.PurchaseOrderResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.*;
import org.akira.ladux.model.enums.PurchaseOrderStatus;
import org.akira.ladux.model.enums.StockMovementType;
import org.akira.ladux.model.enums.StockReferenceType;
import org.akira.ladux.repository.*;
import org.akira.ladux.service.PurchaseOrderService;
import org.akira.ladux.service.StockMovementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

// Quan ly don mua hang tu nha cung cap (luong nhap kho).
// Vong doi: PENDING -> CONFIRMED -> PARTIALLY_RECEIVED -> RECEIVED (hoac CANCELLED).
// receiveGoods: moi lan nhan hang -> cong ton kho + ghi PURCHASE_IN. Tu dong RECEIVED khi nhan du.
@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository repo;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final StockMovementService stockMovementService;

    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderCreateRequest request, Integer createdByUserId) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nha cung cap id = " + request.supplierId()));

        User createdBy = createdByUserId == null ? null
                : userRepository.findById(createdByUserId).orElse(null);

        PurchaseOrder po = PurchaseOrder.builder()
                .supplier(supplier)
                .status(PurchaseOrderStatus.PENDING)
                .expectedDeliveryDate(request.expectedDeliveryDate())
                .note(request.note())
                .createdBy(createdBy)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (AdminPurchaseOrderItemRequest line : request.items()) {
            ProductVariant productVariant = productVariantRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id = " + line.productId()));
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .productVariant(productVariant)
                    .quantity(line.quantity())
                    .costPrice(line.costPrice())
                    .receivedQuantity(0)
                    .note(line.note())
                    .build();
            po.getItems().add(item);
            total = total.add(line.costPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        po.setTotalAmount(total);

        return PurchaseOrderResponse.fromEntity(repo.save(po));
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(int id) {
        return PurchaseOrderResponse.fromEntity(repo.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don mua hang id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getAllPurchaseOrders(Pageable pageable) {
        return repo.findAll(pageable).map(PurchaseOrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status, Pageable pageable) {
        return repo.findByStatus(status, pageable).map(PurchaseOrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getPurchaseOrdersBySupplier(int supplierId, Pageable pageable) {
        return repo.findBySupplierId(supplierId, pageable).map(PurchaseOrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updateStatus(int id, PurchaseOrderStatusUpdateRequest request) {
        PurchaseOrder po = repo.findWithItemsByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don mua hang id = " + id));

        PurchaseOrderStatus current = po.getStatus();
        PurchaseOrderStatus target = request.status();

        if (current == PurchaseOrderStatus.RECEIVED || current == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Don mua hang da o trang thai cuoi (" + current + "), khong the doi");
        }
        if (target == PurchaseOrderStatus.CANCELLED
                && !(current == PurchaseOrderStatus.PENDING || current == PurchaseOrderStatus.CONFIRMED)) {
            throw new BusinessRuleException("Chi huy don khi dang PENDING hoac CONFIRMED");
        }
        po.setStatus(target);
        return PurchaseOrderResponse.fromEntity(po);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse receiveGoods(int id, AdminPurchaseOrderReceiveRequest request, Integer receivedByUserId) {
        PurchaseOrder po = repo.findWithItemsByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don mua hang id = " + id));

        if (po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Don mua hang da bi huy, khong the nhan hang");
        }
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BusinessRuleException("Don mua hang da nhan du, khong the nhan them");
        }

        User receivedBy = receivedByUserId == null ? null
                : userRepository.findById(receivedByUserId).orElse(null);

        for (AdminPurchaseOrderReceiveRequest.ReceiveLine line : request.lines()) {
            if (line.receivedQuantity() == null || line.receivedQuantity() == 0) {
                continue;
            }
            PurchaseOrderItem item = po.getItems().stream()
                    .filter(i -> i.getId().equals(line.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessRuleException(
                            "Dong " + line.itemId() + " khong thuoc don mua hang " + id));

            int alreadyReceived = item.getReceivedQuantity() == null ? 0 : item.getReceivedQuantity();
            int newReceived = alreadyReceived + line.receivedQuantity();
            if (newReceived > item.getQuantity()) {
                throw new BusinessRuleException("So luong nhan vuot qua so luong dat cho dong " + item.getId());
            }

            // Cong ton kho + ghi stock movement (PURCHASE_IN), khoa product de tranh race. 
            ProductVariant productVariant = productVariantRepository.findByIdForUpdate(item.getProductVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Khong tim thay san pham id = " + item.getProductVariant().getId()));
            stockMovementService.recordMovement(
                    productVariant,
                    line.receivedQuantity(),
                    StockMovementType.PURCHASE_IN,
                    StockReferenceType.PURCHASE_ORDER,
                    po.getId().intValue(),
                    "Nhan hang tu don mua #" + po.getId(),
                    receivedBy);

            item.setReceivedQuantity(newReceived);
        }

        po.setStatus(resolveStatusAfterReceive(po));
        return PurchaseOrderResponse.fromEntity(po);
    }

    private PurchaseOrderStatus resolveStatusAfterReceive(PurchaseOrder po) {
        boolean allReceived = po.getItems().stream()
                .allMatch(i -> (i.getReceivedQuantity() == null ? 0 : i.getReceivedQuantity()) >= i.getQuantity());
        if (allReceived) {
            return PurchaseOrderStatus.RECEIVED;
        }
        boolean anyReceived = po.getItems().stream()
                .anyMatch(i -> (i.getReceivedQuantity() == null ? 0 : i.getReceivedQuantity()) > 0);
        return anyReceived ? PurchaseOrderStatus.PARTIALLY_RECEIVED : po.getStatus();
    }
}
