package org.akira.ladux.service;

import org.akira.ladux.dto.inventory.request.SupplierRequest;
import org.akira.ladux.dto.inventory.response.SupplierResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SupplierService {
    Page<SupplierResponse> getAllSuppliers(Pageable pageable);

    Page<SupplierResponse> getActiveSuppliers(Pageable pageable);

    SupplierResponse getSupplierById(int id);

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse updateSupplier(int id, SupplierRequest request);

    void deleteSupplierById(int id);

    Page<SupplierResponse> searchSuppliers(String name, String phone, Pageable pageable);
}
