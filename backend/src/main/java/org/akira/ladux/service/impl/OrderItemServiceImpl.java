package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.order.response.OrderItemResponse;
import org.akira.ladux.repository.OrderItemRepository;
import org.akira.ladux.service.OrderItemService;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {
    private final OrderItemRepository repo;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderItems", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderItemResponse> getAllOrderItems(Pageable pageable) {
        return repo.findAll(pageable)
                .map(OrderItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderItems", key = "'id:' + #id")
    public OrderItemResponse getOrderItemById(int id) {
        return OrderItemResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order item voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orderItems", key = "'order:' + #orderId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderItemResponse> getOrderItemsByOrderId(int orderId, Pageable pageable) {
        return repo.findByOrderId(orderId, pageable)
                .map(OrderItemResponse::fromEntity);
    }

}
