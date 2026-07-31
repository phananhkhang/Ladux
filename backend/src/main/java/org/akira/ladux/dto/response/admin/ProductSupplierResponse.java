package org.akira.ladux.dto.response.admin;

import java.io.Serializable;
import java.math.BigDecimal;

import org.akira.ladux.model.ProductSupplier;

public record ProductSupplierResponse(
        Integer id,
        Integer productId,
        String productName,
        Integer supplierId,
        String supplierName,
        BigDecimal costPrice,
        Integer leadTimeDays
) implements Serializable {
    public static ProductSupplierResponse fromEntity(ProductSupplier ps) {
        if (ps == null) {
            return null;
        }
        return new ProductSupplierResponse(
                ps.getId(),
                ps.getProduct() == null ? null : ps.getProduct().getId(),
                ps.getProduct() == null ? null : ps.getProduct().getName(),
                ps.getSupplier() == null ? null : ps.getSupplier().getId(),
                ps.getSupplier() == null ? null : ps.getSupplier().getName(),
                ps.getCostPrice(),
                ps.getLeadTimeDays()
        );
    }
}
