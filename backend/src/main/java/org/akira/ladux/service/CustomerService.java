package org.akira.ladux.service;

import org.akira.ladux.dto.request.admin.AdminCustomerUpdateRequest;
import org.akira.ladux.dto.response.admin.CustomerResponse;
import org.akira.ladux.model.enums.CustomerLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    Page<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable);

    CustomerResponse getCustomerByUserId(int userId);

    CustomerResponse updateCustomer(int userId, AdminCustomerUpdateRequest request);

    Page<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable);
}
