package org.akira.auratech.service;

import org.akira.auratech.dto.request.CustomerUpdateRequest;
import org.akira.auratech.dto.response.CustomerResponse;
import org.akira.auratech.model.enums.CustomerLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    Page<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable);

    CustomerResponse getCustomerByUserId(int userId);

    CustomerResponse updateCustomer(int userId, CustomerUpdateRequest request);

    Page<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable);
}
