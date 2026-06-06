package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.repository.OrderHistoryRepository;
import org.akira.auratech.service.OrderHistoryService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderHistoryServiceImpl implements OrderHistoryService {
    private final OrderHistoryRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getAllOrderHistories() {
        return repo.findAll().stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderHistoryResponse getOrderHistoryById(int id) {
        return OrderHistoryResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order history voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId) {
        return repo.findByOrderId(orderId).stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }
}
