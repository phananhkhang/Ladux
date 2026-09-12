package org.akira.ladux.service;

import org.akira.ladux.dto.inventory.request.SupplierRequest;
import org.akira.ladux.dto.inventory.response.SupplierResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface SupplierService {
    PageResponse<SupplierResponse> getAllSuppliers(Pageable pageable);

    PageResponse<SupplierResponse> getActiveSuppliers(Pageable pageable);

    SupplierResponse getSupplierById(int id);

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse updateSupplier(int id, SupplierRequest request);

    void deleteSupplierById(int id);

    PageResponse<SupplierResponse> searchSuppliers(String name, String phone, Pageable pageable);
}
