package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.OrderItemRequest;
import org.akira.auratech.dto.OrderItemResponse;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderItem;
import org.akira.auratech.model.Product;
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

    @Override
    public OrderItemResponse createOrderItem(OrderItemRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.getOrderId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.getProductId()));
        if (order == null || product == null) {
            return null;
        }
        OrderItem item = OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(request.getQuantity() == null ? 1 : request.getQuantity())
                .priceAtPurchase(request.getPriceAtPurchase())
                .build();
        return OrderItemResponse.fromEntity(repo.save(item));
    }

    @Override
    public OrderItemResponse updateOrderItem(int id, OrderItemRequest request) {
        OrderItem item = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order item voi id = " + id));
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.getOrderId()));
            item.setOrder(order);
        }
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.getProductId()));
            item.setProduct(product);
        }
        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getPriceAtPurchase() != null) {
            item.setPriceAtPurchase(request.getPriceAtPurchase());
        }
        return OrderItemResponse.fromEntity(repo.save(item));
    }

    @Override
    public void deleteOrderItemById(int id) {
        repo.deleteById(id);
    }
}
