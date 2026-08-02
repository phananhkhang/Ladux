package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.AdminCustomerUpdateRequest;
import org.akira.ladux.dto.user.request.UpdateInformationPersonal;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.model.enums.CustomerLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    Page<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable);

    CustomerResponse getCustomerByUserId(int userId);

    CustomerResponse updateCustomer(int userId, AdminCustomerUpdateRequest request);

    Page<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable);

    UserResponse updateInformationPersonal(UpdateInformationPersonal request);


}
