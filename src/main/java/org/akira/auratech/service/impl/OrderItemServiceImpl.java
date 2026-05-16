package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.OrderItem;
import org.akira.auratech.repository.OrderItemRepository;
import org.akira.auratech.service.OrderItemService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {
    private final OrderItemRepository repo;

    @Override
    public List<OrderItem> getAllOrderItems() {
        return repo.findAll();
    }

    @Override
    public OrderItem getOrderItemById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        return repo.findByOrderId(orderId);
    }

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return repo.save(orderItem);
    }

    @Override
    public OrderItem updateOrderItem(OrderItem orderItem) {
        return repo.save(orderItem);
    }

    @Override
    public void deleteOrderItemById(int id) {
        repo.deleteById(id);
    }
}

