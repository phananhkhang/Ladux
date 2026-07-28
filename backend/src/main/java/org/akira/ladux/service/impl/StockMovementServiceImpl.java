package org.akira.ladux.service.impl;

import org.akira.ladux.dto.request.StockMovementRequest;
import org.akira.ladux.dto.response.StockMovementResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.InsufficientStockException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.model.StockMovement;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.StockMovementType;
import org.akira.ladux.model.enums.StockReferenceType;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.repository.ProductVariantRepository;
import org.akira.ladux.repository.StockMovementRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.StockMovementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

// So cai bien dong ton kho — audit trail moi thay doi stock.
// recordMovement: cap nhat stockQuantity + ghi so (nhap hang PO, dieu chinh thu cong).
// recordLedgerEntry: chi ghi so, KHONG doi stock (stock da thay doi boi caller: checkout, hoan kho).
@Service
@RequiredArgsConstructor
public class StockMovementServiceImpl implements StockMovementService {

    private final StockMovementRepository repo;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StockMovementResponse createAdjustment(StockMovementRequest request, Integer createdByUserId) {
        ProductVariant productVariant = productVariantRepository.findByIdForUpdate(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id = " + request.productId()));

        User createdBy = createdByUserId == null ? null
                : userRepository.findById(createdByUserId).orElse(null);

        int signed = signedQuantity(request.movementType(), request.quantity());
        StockMovement movement = recordMovement(
                productVariant, signed, request.movementType(),
                StockReferenceType.ADJUSTMENT, (Integer) null, request.note(), createdBy);
        return StockMovementResponse.fromEntity(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getMovementsByProduct(int productId, Pageable pageable) {
        return repo.findByProductVariantId(productId, pageable).map(StockMovementResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getAllMovements(Pageable pageable) {
        return repo.findAll(pageable).map(StockMovementResponse::fromEntity);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public StockMovement recordMovement(
            ProductVariant productVariant,
            int signedQuantity,
            StockMovementType movementType,
            StockReferenceType referenceType,
            Integer referenceId,
            String note,
            User createdBy
    ) {
        if (signedQuantity == 0) {
            throw new BusinessRuleException("So luong bien dong khong duoc bang 0");
        }
        int newStock = productVariant.getStockQuantity() + signedQuantity;
        if (newStock < 0) {
            throw new InsufficientStockException("Ton kho khong du de xuat (san pham id = " + productVariant.getId() + ")");
        }
        productVariant.setStockQuantity(newStock);

        StockMovement movement = StockMovement.builder()
                .productVariant(productVariant)
                .quantity(signedQuantity)
                .movementType(movementType)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .createdBy(createdBy)
                .build();
        return repo.save(movement);
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public StockMovement recordLedgerEntry(
            ProductVariant productVariant,
            int signedQuantity,
            StockMovementType movementType,
            StockReferenceType referenceType,
            Integer referenceId,
            String note,
            User createdBy
    ) {
        if (signedQuantity == 0) {
            throw new BusinessRuleException("So luong bien dong khong duoc bang 0");
        }
        // KHONG dung product.setStockQuantity() — ton kho da duoc thay doi boi caller.
        StockMovement movement = StockMovement.builder()
                .productVariant(productVariant)
                .quantity(signedQuantity)
                .movementType(movementType)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .createdBy(createdBy)
                .build();
        return repo.save(movement);
    }

    /** Suy ra dau (+/-) tu loai bien dong; quantity dau vao luon duong. */
    private int signedQuantity(StockMovementType type, int quantity) {
        return switch (type) {
            case PURCHASE_IN, RETURN_IN, ADJUSTMENT_IN -> quantity;
            case SALE_OUT, DAMAGE_OUT, ADJUSTMENT_OUT -> -quantity;
            case OTHER -> quantity; // mac dinh coi la nhap; dung note de ghi ro
        };
    }
}
