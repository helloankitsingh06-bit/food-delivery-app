package com.edutech.fooddeliverysystem.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order placeOrder(Order order) {
        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public Order updateOrderStatus(Long orderId, Order.Status status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }

        return null;
    }
}