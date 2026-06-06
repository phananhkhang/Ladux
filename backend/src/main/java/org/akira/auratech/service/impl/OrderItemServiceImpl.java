package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.OrderItemResponse;
import org.akira.auratech.repository.OrderItemRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.OrderItemService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {
    private final OrderItemRepository repo;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderItemResponse> getAllOrderItems(Pageable pageable) {
        return repo.findAll(pageable)
                .map(OrderItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderItemResponse getOrderItemById(int id) {
        return OrderItemResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order item voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderItemResponse> getOrderItemsByOrderId(int orderId, Pageable pageable) {
        return repo.findByOrderId(orderId, pageable)
                .map(OrderItemResponse::fromEntity);
    }

}
