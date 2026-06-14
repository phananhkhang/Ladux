package org.akira.auratech.service;

import org.akira.auratech.dto.request.StockMovementRequest;
import org.akira.auratech.dto.response.StockMovementResponse;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.StockMovement;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.StockMovementType;
import org.akira.auratech.model.enums.StockReferenceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StockMovementService {

    /** Tao bien dong kho thu cong (dieu chinh kiem ke, hang hong...). */
    StockMovementResponse createAdjustment(StockMovementRequest request, Integer createdByUserId);

    Page<StockMovementResponse> getMovementsByProduct(int productId, Pageable pageable);

    Page<StockMovementResponse> getAllMovements(Pageable pageable);

    /**
     * Ghi nhan bien dong kho + cap nhat ton kho cua product (1 noi duy nhat).
     * signedQuantity: + nhap kho, - xuat kho. Dung tu cac luong khac (vd nhan hang PO).
     * Yeu cau chay trong transaction cua caller.
     */
    StockMovement recordMovement(
            Product product,
            int signedQuantity,
            StockMovementType movementType,
            StockReferenceType referenceType,
            Long referenceId,
            String note,
            User createdBy
    );

    /**
     * CHI GHI SO bien dong kho — KHONG thay doi product.stockQuantity.
     * Dung cho cac luong da tu thay doi ton kho bang co che rieng (tranh tru/cong KEP), vi du:
     *  - Ban hang: ton da bi tru boi {@code deductStockAtomically} (UPDATE atomic chong oversell).
     *  - Huy/het han don: ton da duoc cong lai truc tiep tren entity khi giai phong giu cho.
     * Yeu cau chay trong transaction cua caller.
     */
    StockMovement recordLedgerEntry(
            Product product,
            int signedQuantity,
            StockMovementType movementType,
            StockReferenceType referenceType,
            Long referenceId,
            String note,
            User createdBy
    );
}
