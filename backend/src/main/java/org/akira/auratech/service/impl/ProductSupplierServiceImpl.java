package org.akira.auratech.service.impl;

import java.util.List;

import org.akira.auratech.dto.request.ProductSupplierRequest;
import org.akira.auratech.dto.response.ProductSupplierResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.ProductSupplier;
import org.akira.auratech.model.Supplier;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.ProductSupplierRepository;
import org.akira.auratech.repository.SupplierRepository;
import org.akira.auratech.service.ProductSupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductSupplierServiceImpl implements ProductSupplierService {

    private final ProductSupplierRepository repo;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public ProductSupplierResponse link(ProductSupplierRequest request) {
        if (repo.existsByProductIdAndSupplierId(request.productId(), request.supplierId())) {
            throw new BusinessRuleException("San pham nay da duoc lien ket voi nha cung cap nay");
        }
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id = " + request.productId()));
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nha cung cap id = " + request.supplierId()));

        ProductSupplier ps = ProductSupplier.builder()
                .product(product)
                .supplier(supplier)
                .costPrice(request.costPrice())
                .leadTimeDays(request.leadTimeDays())
                .build();
        return ProductSupplierResponse.fromEntity(repo.save(ps));
    }

    @Override
    @Transactional
    public ProductSupplierResponse update(long id, ProductSupplierRequest request) {
        ProductSupplier ps = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay lien ket san pham-nha cung cap id = " + id));
        ps.setCostPrice(request.costPrice());
        ps.setLeadTimeDays(request.leadTimeDays());
        return ProductSupplierResponse.fromEntity(ps);
    }

    @Override
    @Transactional
    public void unlink(long id) {
        ProductSupplier ps = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay lien ket san pham-nha cung cap id = " + id));
        repo.delete(ps);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSupplierResponse> getByProduct(int productId) {
        return repo.findByProductId(productId).stream().map(ProductSupplierResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSupplierResponse> getBySupplier(int supplierId) {
        return repo.findBySupplierId(supplierId).stream().map(ProductSupplierResponse::fromEntity).toList();
    }
}
