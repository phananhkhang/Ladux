package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderItemResponse;
import org.akira.auratech.repository.OrderItemRepository;
import org.akira.auratech.service.OrderItemService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {
    private final OrderItemRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponse> getAllOrderItems() {
        return repo.findAll().stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderItemResponse getOrderItemById(int id) {
        return OrderItemResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order item voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponse> getOrderItemsByOrderId(int orderId) {
        return repo.findByOrderId(orderId).stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
    }

}
