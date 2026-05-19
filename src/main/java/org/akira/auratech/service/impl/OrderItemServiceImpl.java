package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderItemResponse;
import org.akira.auratech.repository.OrderItemRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.OrderItemService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {
    private final OrderItemRepository repo;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    public List<OrderItemResponse> getAllOrderItems() {
        return repo.findAll().stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderItemResponse getOrderItemById(int id) {
        return OrderItemResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order item voi id = " + id)));
    }

    @Override
    public List<OrderItemResponse> getOrderItemsByOrderId(int orderId) {
        return repo.findByOrderId(orderId).stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
    }

}
