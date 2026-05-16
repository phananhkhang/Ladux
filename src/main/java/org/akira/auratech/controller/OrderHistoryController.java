package org.akira.auratech.controller;

import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.service.OrderHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-histories")
public class OrderHistoryController {
    @Autowired
    OrderHistoryService service;

    @GetMapping("/all")
    public List<OrderHistory> getAllOrderHistories() {
        return service.getAllOrderHistories();
    }

    @GetMapping("/{id}")
    public OrderHistory getOrderHistoryById(@PathVariable int id) {
        return service.getOrderHistoryById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderHistory> getOrderHistoriesByOrderId(@PathVariable int orderId) {
        return service.getOrderHistoriesByOrderId(orderId);
    }

    @PostMapping
    public OrderHistory createOrderHistory(@RequestBody OrderHistory history) {
        return service.createOrderHistory(history);
    }

    @PutMapping
    public OrderHistory updateOrderHistory(@RequestBody OrderHistory history) {
        return service.updateOrderHistory(history);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderHistoryById(@PathVariable int id) {
        service.deleteOrderHistoryById(id);
    }
}

