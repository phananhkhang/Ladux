package org.akira.auratech.controller;

import org.akira.auratech.model.OrderItem;
import org.akira.auratech.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-items")
public class OrderItemController {
    @Autowired
    OrderItemService service;

    @GetMapping("/all")
    public List<OrderItem> getAllOrderItems() {
        return service.getAllOrderItems();
    }

    @GetMapping("/{id}")
    public OrderItem getOrderItemById(@PathVariable int id) {
        return service.getOrderItemById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItem> getOrderItemsByOrderId(@PathVariable int orderId) {
        return service.getOrderItemsByOrderId(orderId);
    }

    @PostMapping
    public OrderItem createOrderItem(@RequestBody OrderItem orderItem) {
        return service.createOrderItem(orderItem);
    }

    @PutMapping
    public OrderItem updateOrderItem(@RequestBody OrderItem orderItem) {
        return service.updateOrderItem(orderItem);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderItemById(@PathVariable int id) {
        service.deleteOrderItemById(id);
    }
}

