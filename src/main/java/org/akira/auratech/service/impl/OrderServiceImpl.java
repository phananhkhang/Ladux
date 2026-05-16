package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.service.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository repo;

    @Override
    public List<Order> getAllOrders() {
        return repo.findAll();
    }

    @Override
    public Order getOrderById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Order> getOrdersByUserId(int userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return repo.findByStatus(status);
    }

    @Override
    public Order createOrder(Order order) {
        return repo.save(order);
    }

    @Override
    public Order updateOrder(Order order) {
        return repo.save(order);
    }

    @Override
    public void deleteOrderById(int id) {
        repo.deleteById(id);
    }
}

