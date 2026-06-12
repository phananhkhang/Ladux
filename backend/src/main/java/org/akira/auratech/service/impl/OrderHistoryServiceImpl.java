package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.repository.OrderHistoryRepository;
import org.akira.auratech.service.OrderHistoryService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderHistoryServiceImpl implements OrderHistoryService {
    private final OrderHistoryRepository repo;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderHistories", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderHistoryResponse> getAllOrderHistories(Pageable pageable) {
        return repo.findAll(pageable)
                .map(OrderHistoryResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderHistories", key = "'id:' + #id")
    public OrderHistoryResponse getOrderHistoryById(int id) {
        return OrderHistoryResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order history voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderHistories", key = "'order:' + #orderId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId, Pageable pageable) {
        return repo.findByOrderId(orderId, pageable)
                .map(OrderHistoryResponse::fromEntity);
    }
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderHistories", key = "'user:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderHistoryResponse> getOrdersHistoryByUser(Integer userId, Pageable pageable) {
        return repo.findByUserId(userId, pageable)
                .map(OrderHistoryResponse::fromEntity);
    }
}
