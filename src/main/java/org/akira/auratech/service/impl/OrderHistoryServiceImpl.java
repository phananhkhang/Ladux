package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderHistoryRequest;
import org.akira.auratech.dto.OrderHistoryResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.repository.OrderHistoryRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderHistoryServiceImpl implements OrderHistoryService {
    private final OrderHistoryRepository repo;
    private final OrderRepository orderRepository;

    @Override
    public List<OrderHistoryResponse> getAllOrderHistories() {
        return repo.findAll().stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderHistoryResponse getOrderHistoryById(int id) {
        return OrderHistoryResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public List<OrderHistoryResponse> getOrderHistoriesByOrderId(int orderId) {
        return repo.findByOrderId(orderId).stream()
                .map(OrderHistoryResponse::fromEntity)
                .toList();
    }

    @Override
    public OrderHistoryResponse createOrderHistory(OrderHistoryRequest request) {
        Order order = orderRepository.findById(request.getOrderId()).orElse(null);
        if (order == null) {
            return null;
        }
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .status(request.getStatus())
                .description(request.getDescription())
                .build();
        return OrderHistoryResponse.fromEntity(repo.save(history));
    }

    @Override
    public OrderHistoryResponse updateOrderHistory(int id, OrderHistoryRequest request) {
        OrderHistory history = repo.findById(id).orElse(null);
        if (history == null) {
            return null;
        }
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId()).orElse(null);
            if (order == null) {
                return null;
            }
            history.setOrder(order);
        }
        if (request.getStatus() != null) {
            history.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            history.setDescription(request.getDescription());
        }
        return OrderHistoryResponse.fromEntity(repo.save(history));
    }

    @Override
    public void deleteOrderHistoryById(int id) {
        repo.deleteById(id);
    }
}
