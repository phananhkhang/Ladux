package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.repository.OrderHistoryRepository;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderHistoryServiceImpl implements OrderHistoryService {
    private final OrderHistoryRepository repo;

    @Override
    public List<OrderHistory> getAllOrderHistories() {
        return repo.findAll();
    }

    @Override
    public OrderHistory getOrderHistoryById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<OrderHistory> getOrderHistoriesByOrderId(int orderId) {
        return repo.findByOrderId(orderId);
    }

    @Override
    public OrderHistory createOrderHistory(OrderHistory history) {
        return repo.save(history);
    }

    @Override
    public OrderHistory updateOrderHistory(OrderHistory history) {
        return repo.save(history);
    }

    @Override
    public void deleteOrderHistoryById(int id) {
        repo.deleteById(id);
    }
}

