package org.akira.ladux.service;

import java.util.List;

import org.akira.ladux.dto.request.admin.ProductSupplierRequest;
import org.akira.ladux.dto.response.admin.ProductSupplierResponse;

public interface ProductSupplierService {

    ProductSupplierResponse link(ProductSupplierRequest request);

    ProductSupplierResponse update(long id, ProductSupplierRequest request);

    void unlink(long id);

    List<ProductSupplierResponse> getByProduct(int productId);

    List<ProductSupplierResponse> getBySupplier(int supplierId);
}
