package org.akira.auratech.service;

import java.util.List;

import org.akira.auratech.dto.request.ProductSupplierRequest;
import org.akira.auratech.dto.response.ProductSupplierResponse;

public interface ProductSupplierService {

    ProductSupplierResponse link(ProductSupplierRequest request);

    ProductSupplierResponse update(long id, ProductSupplierRequest request);

    void unlink(long id);

    List<ProductSupplierResponse> getByProduct(int productId);

    List<ProductSupplierResponse> getBySupplier(int supplierId);
}
