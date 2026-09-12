package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.AdminCustomerUpdateRequest;
import org.akira.ladux.dto.user.request.UpdateInformationPersonal;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.model.enums.CustomerLevel;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    PageResponse<CustomerResponse> getAllCustomers(Pageable pageable);

    PageResponse<CustomerResponse> getCustomersByLevel(CustomerLevel level, Pageable pageable);

    CustomerResponse getCustomerByUserId(int userId);

    CustomerResponse updateCustomer(int userId, AdminCustomerUpdateRequest request);

    PageResponse<CustomerResponse> searchCustomers(String name, String phone, Pageable pageable);

    UserResponse updateInformationPersonal(UpdateInformationPersonal request);


}
