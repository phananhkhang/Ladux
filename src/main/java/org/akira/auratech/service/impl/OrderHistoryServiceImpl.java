package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderHistoryResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.repository.OrderHistoryRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.service.OrderHistoryService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderHistoryServiceImpl implements OrderHistoryService {
    private final OrderHistoryRepository repo;

    @Override
    public List<OrderHistoryResponse> getAllOrderHistories() {
        return repo.findAll().stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderHistoryResponse getOrderHistoryById(int id) {
        return OrderHistoryResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order history voi id = " + id)));
    }

    @Override
    public List<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId) {
        return repo.findByOrderId(orderId).stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }
}
