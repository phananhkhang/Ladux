package org.akira.ladux.service;

import org.akira.ladux.dto.request.CustomerUpdateRequest;
import org.akira.ladux.dto.response.CustomerResponse;
import org.akira.ladux.model.enums.CustomerLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    Page<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable);

    CustomerResponse getCustomerByUserId(int userId);

    CustomerResponse updateCustomer(int userId, CustomerUpdateRequest request);

    Page<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable);
}
