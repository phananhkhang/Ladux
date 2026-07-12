package org.akira.ladux.service.impl;

import org.akira.ladux.dto.request.CustomerUpdateRequest;
import org.akira.ladux.dto.response.CustomerResponse;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Customer;
import org.akira.ladux.model.enums.CustomerLevel;
import org.akira.ladux.repository.CustomerRepository;
import org.akira.ladux.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return repo.findAll(pageable).map(CustomerResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable) {
        return repo.findByLevel(level, pageable).map(CustomerResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByUserId(int userId) {
        return CustomerResponse.fromEntity(findOrThrow(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable) {
        return repo.findByNameOrPhone(name, phone, pageable);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(int userId, CustomerUpdateRequest request) {
        Customer customer = findOrThrow(userId);
        if (request.fullName() != null) {
            customer.setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            customer.setPhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            customer.setAvatarUrl(request.avatarUrl());
        }
        if (request.level() != null) {
            customer.setLevel(request.level());
        }
        if (request.loyaltyPoints() != null) {
            customer.setLoyaltyPoints(request.loyaltyPoints());
        }
        if (request.totalSpent() != null) {
            customer.setTotalSpent(request.totalSpent());
        }
        return CustomerResponse.fromEntity(customer);
    }

    private Customer findOrThrow(int userId) {
        return repo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang voi userId = " + userId));
    }
}
