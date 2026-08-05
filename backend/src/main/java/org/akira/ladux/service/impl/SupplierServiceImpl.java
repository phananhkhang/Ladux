package org.akira.ladux.service.impl;

import com.twilio.type.PhoneNumber;
import org.akira.ladux.dto.inventory.request.SupplierRequest;
import org.akira.ladux.dto.inventory.response.SupplierResponse;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Supplier;
import org.akira.ladux.repository.SupplierRepository;
import org.akira.ladux.service.SupplierService;
import org.akira.ladux.utils.PhoneNumberUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> getAllSuppliers(Pageable pageable) {
        return repo.findAll(pageable).map(SupplierResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> getActiveSuppliers(Pageable pageable) {
        return repo.findByIsActiveTrue(pageable).map(SupplierResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(int id) {
        return SupplierResponse.fromEntity(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> searchSuppliers(String name, String phone, Pageable pageable) {
        String searchName = (name != null && !name.isBlank()) ? name.trim() : null;
        String searchPhone = (phone != null && !phone.isBlank()) ? phone.trim() : null;
        return repo.searchByNameOrPhone(searchName, searchPhone, pageable);
    }

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Tên nhà cung cấp không được để trống");
        }
        if (request.phone() == null || request.phone().isBlank()) {
            throw new IllegalArgumentException("Số điện thoại nhà cung cấp không được để trống");
        }
        String phoneNormalized = request.phone().trim();
        phoneNormalized = PhoneNumberUtils.normalize(phoneNormalized);
        Supplier supplier = Supplier.builder()
                .name(request.name().trim())
                .address(request.address())
                .phone(phoneNormalized)
                .email(request.email())
                .isActive(request.isActive() == null || request.isActive())
                .build();
        return SupplierResponse.fromEntity(repo.save(supplier));
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(int id, SupplierRequest request) {
        Supplier supplier = findOrThrow(id);
        supplier.setName(request.name().trim());
        supplier.setAddress(request.address());
        supplier.setPhone(request.phone());
        supplier.setEmail(request.email());
        if (request.isActive() != null) {
            supplier.setActive(request.isActive());
        }
        return SupplierResponse.fromEntity(supplier);
    }

    @Override
    @Transactional
    public void deleteSupplierById(int id) {
        repo.delete(findOrThrow(id));
    }

    private Supplier findOrThrow(int id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nha cung cap voi id = " + id));
    }
}
