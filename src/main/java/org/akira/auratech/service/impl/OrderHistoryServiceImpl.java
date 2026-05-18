package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderHistoryRequest;
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
    private final OrderRepository orderRepository;

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

    @Override
    public OrderHistoryResponse createOrderHistory(OrderHistoryRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
        if (order == null) {
            return null;
        }
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .status(request.status())
                .description(request.description())
                .build();
        return OrderHistoryResponse.fromEntity(repo.save(history));
    }

    @Override
    public OrderHistoryResponse updateOrderHistory(int id, OrderHistoryRequest request) {
        OrderHistory history = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order history voi id = " + id));
        if (request.orderId() != null) {
            Order order = orderRepository.findById(request.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
            history.setOrder(order);
        }
        if (request.status() != null) {
            history.setStatus(request.status());
        }
        if (request.description() != null) {
            history.setDescription(request.description());
        }
        return OrderHistoryResponse.fromEntity(repo.save(history));
    }

    @Override
    public void deleteOrderHistoryById(int id) {
        repo.deleteById(id);
    }
}
