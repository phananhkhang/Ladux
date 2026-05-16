package org.akira.auratech.controller;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    OrderService service;

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable int id) {
        return service.getOrderById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable int userId) {
        return service.getOrdersByUserId(userId);
    }

    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable OrderStatus status) {
        return service.getOrdersByStatus(status);
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return service.createOrder(order);
    }

    @PutMapping
    public Order updateOrder(@RequestBody Order order) {
        return service.updateOrder(order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderById(@PathVariable int id) {
        service.deleteOrderById(id);
    }
}

