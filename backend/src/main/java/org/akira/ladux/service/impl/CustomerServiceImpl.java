package org.akira.ladux.service.impl;

import org.akira.ladux.dto.user.request.AdminCustomerUpdateRequest;
import org.akira.ladux.dto.user.request.EmailRegisterRequest;
import org.akira.ladux.dto.user.request.UpdateInformationPersonal;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Customer;
import org.akira.ladux.model.enums.CustomerLevel;
import org.akira.ladux.repository.CustomerRepository;
import org.akira.ladux.service.CustomerService;
import org.akira.ladux.utils.PhoneNumberUtils;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repo;
    private final PhoneNumberUtils phoneNumberUtils;

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
        String searchName = cleanSearch(name);
        String searchPhone = cleanSearch(phone);
        if (searchPhone != null) {
            searchPhone = searchPhone.replaceAll("[\\s.()\\-]", "");
            try {
                searchPhone = phoneNumberUtils.normalize(searchPhone);
            } catch (IllegalArgumentException ignored) {
                // Keep raw input so partial/non-Vietnamese phone search still works.
            }
        }
        return repo.findByNameOrPhone(searchName, searchPhone, pageable);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(int userId, AdminCustomerUpdateRequest request) {
        Customer customer = findOrThrow(userId);
        if (request.fullName() != null) {
            customer.setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            String normalizedPhone;
            try {
                normalizedPhone = phoneNumberUtils.normalize(request.phone());
            } catch (IllegalArgumentException exception) {
                throw new BusinessRuleException(exception.getMessage());
            }
            if (repo.existsByPhoneAndIdNot(normalizedPhone, userId)) {
                throw new BusinessRuleException("Số điện thoại đã được tài khoản khác sử dụng");
            }
            customer.setPhone(normalizedPhone);
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
    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateInformationPersonal(UpdateInformationPersonal request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        Customer customer = findOrThrow(userId);
        customer.setFullName(request.fullName().trim());
        return UserResponse.fromEntity(customer.getUser());
    }



    private Customer findOrThrow(int userId) {
        return repo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang voi userId = " + userId));
    }

    private String cleanSearch(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
